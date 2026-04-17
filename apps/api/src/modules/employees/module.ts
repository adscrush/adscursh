import Elysia from "elysia"
import {
  eq,
  like,
  and,
  or,
  asc,
  desc,
  gte,
  lte,
  inArray,
  sql,
} from "@adscrush/db/drizzle"
import {
  employees,
  users,
  departments,
  employeeAffiliateAccess,
  employeeAdvertiserAccess,
} from "@adscrush/db/schema"
import { filterColumns, getColumn } from "@adscrush/db/lib/filter-columns"
import { db } from "~/lib/db"
import { AppError } from "~/utils/errors"
import { auth } from "~/lib/auth"
import { requireAdmin } from "~/middleware/auth.middleware"
import { listQuerySchema } from "./config"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeAccessSchema,
  bulkUpdateStatusSchema,
  bulkDeleteSchema,
} from "@adscrush/shared/validators/employee.validator"

export const employeeRoutes = new Elysia({ prefix: "/employees" })
  .use(requireAdmin)

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const parsed = listQuerySchema.parse(query)
      const {
        page,
        perPage,
        filterFlag,
        name,
        status,
        createdAt,
        joinOperator,
        sort,
        filters,
      } = parsed

      const offset = (page - 1) * perPage

      const advancedTable =
        filterFlag === "advancedFilters" || filterFlag === "commandFilters"

      const tableWithJoinedColumns = {
        ...employees,
        name: users.name,
        email: users.email,
        role: users.role,
        departmentName: departments.name,
      }

      const advancedWhere = filterColumns({
        table: tableWithJoinedColumns,
        filters,
        joinOperator,
        database: "postgres",
      })

      const simpleWhere =
        name || status.length > 0 || createdAt.length > 0
          ? and(
              name ? like(users.name, `%${name}%`) : undefined,
              status.length > 0
                ? or(...status.map((s) => eq(employees.status, s)))
                : undefined,
              createdAt.length > 0
                ? and(
                    createdAt[0]
                      ? gte(
                          employees.createdAt,
                          (() => {
                            const d = new Date(createdAt[0])
                            d.setHours(0, 0, 0, 0)
                            return d
                          })()
                        )
                      : undefined,
                    createdAt[1]
                      ? lte(
                          employees.createdAt,
                          (() => {
                            const d = new Date(createdAt[1])
                            d.setHours(23, 59, 59, 999)
                            return d
                          })()
                        )
                      : undefined
                  )
                : undefined
            )
          : undefined

      const where = advancedTable ? advancedWhere : simpleWhere

      const orderBy =
        sort.length > 0
          ? sort.map((item) =>
              item.desc
                ? desc(getColumn(tableWithJoinedColumns, item.id))
                : asc(getColumn(tableWithJoinedColumns, item.id))
            )
          : [desc(employees.createdAt)]

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: employees.id,
            userId: employees.userId,
            departmentId: employees.departmentId,
            department: employees.department,
            status: employees.status,
            createdAt: employees.createdAt,
            updatedAt: employees.updatedAt,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
            departmentName: departments.name,
          })
          .from(employees)
          .innerJoin(users, eq(employees.userId, users.id))
          .leftJoin(departments, eq(employees.departmentId, departments.id))
          .where(where)
          .limit(perPage)
          .offset(offset)
          .orderBy(...orderBy),
        db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .innerJoin(users, eq(employees.userId, users.id))
          .where(where),
      ])

      const total = Number(countResult[0]?.count ?? 0)
      return {
        success: true,
        data: items,
        meta: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      }
    },
    { query: listQuerySchema }
  )

  // ── GET /:id ───────────────────────────────────────────────────
  .get("/:id", async ({ params }) => {
    const result = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        department: employees.department,
        status: employees.status,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, params.id))
      .limit(1)

    if (!result[0]) throw new AppError(404, "Employee not found")

    const [affAccess, advAccess] = await Promise.all([
      db
        .select({ affiliateId: employeeAffiliateAccess.affiliateId })
        .from(employeeAffiliateAccess)
        .where(eq(employeeAffiliateAccess.employeeId, params.id)),
      db
        .select({ advertiserId: employeeAdvertiserAccess.advertiserId })
        .from(employeeAdvertiserAccess)
        .where(eq(employeeAdvertiserAccess.employeeId, params.id)),
    ])

    return {
      success: true,
      data: {
        ...result[0],
        assignedAffiliateIds: affAccess.map((a) => a.affiliateId),
        assignedAdvertiserIds: advAccess.map((a) => a.advertiserId),
      },
    }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const user = await auth.api.signUpEmail({
        body: { name: body.name, email: body.email, password: body.password },
      })
      if (!user) throw new AppError(400, "Failed to create user account")

      const userId =
        typeof user === "object" && "user" in user
          ? (user as { user: { id: string } }).user.id
          : null
      if (!userId) throw new AppError(400, "Failed to get user ID")

      const [employee] = await db
        .insert(employees)
        .values({ userId, departmentId: body.departmentId })
        .returning()
      return { success: true, data: employee, status: 201 }
    },
    { body: createEmployeeSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const [employee] = await db
        .update(employees)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(employees.id, params.id))
        .returning()
      if (!employee) throw new AppError(404, "Employee not found")
      return { success: true, data: employee }
    },
    { body: updateEmployeeSchema }
  )

  // ── POST /:id/delete ──────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db
      .update(employees)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(employees.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Employee not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── POST /:id/access ────────────────────────────────────────────
  .post(
    "/:id/access",
    async ({ params, body }) => {
      if (body.affiliateIds !== undefined) {
        await db
          .delete(employeeAffiliateAccess)
          .where(eq(employeeAffiliateAccess.employeeId, params.id))
        if (body.affiliateIds.length > 0) {
          await db.insert(employeeAffiliateAccess).values(
            body.affiliateIds.map((affiliateId) => ({
              employeeId: params.id,
              affiliateId,
            }))
          )
        }
      }
      if (body.advertiserIds !== undefined) {
        await db
          .delete(employeeAdvertiserAccess)
          .where(eq(employeeAdvertiserAccess.employeeId, params.id))
        if (body.advertiserIds.length > 0) {
          await db.insert(employeeAdvertiserAccess).values(
            body.advertiserIds.map((advertiserId) => ({
              employeeId: params.id,
              advertiserId,
            }))
          )
        }
      }
      return { success: true }
    },
    { body: updateEmployeeAccessSchema }
  )

  // ── POST /bulk-status ───────────────────────────────────────────
  .post(
    "/bulk-status",
    async ({ body }) => {
      const { ids, status } = bulkUpdateStatusSchema.parse(body)
      await db
        .update(employees)
        .set({ status, updatedAt: new Date() })
        .where(inArray(employees.id, ids))
      return { success: true }
    },
    { body: bulkUpdateStatusSchema }
  )

  // ── POST /bulk-delete ───────────────────────────────────────────
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = bulkDeleteSchema.parse(body)
      await db.delete(employees).where(inArray(employees.id, ids))
      return { success: true, data: { ids } }
    },
    { body: bulkDeleteSchema }
  )
