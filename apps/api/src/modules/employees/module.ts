import Elysia from "elysia"
import { eq, like, sql, and, type SQL } from "@adscrush/db/drizzle"
import {
  employees,
  users,
  employeeAffiliateAccess,
  employeeAdvertiserAccess,
} from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { AppError } from "../../utils/errors"
import { auth } from "../../lib/auth"
import { requireAdmin } from "../../middleware/auth.middleware"
import { listQuerySchema } from "./config"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeAccessSchema,
} from "@adscrush/shared/validators/employee.validator"

export const employeeRoutes = new Elysia({ prefix: "/employees" })
  .use(requireAdmin)

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const {
        page = 1,
        limit = 20,
        search,
        status,
      } = listQuerySchema.parse(query)
      const offset = (page - 1) * limit

      const conditions: SQL[] = []
      if (search) conditions.push(like(users.name, `%${search}%`))
      if (status) conditions.push(eq(employees.status, status))
      const where = conditions.length > 0 ? and(...conditions) : undefined

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: employees.id,
            userId: employees.userId,
            department: employees.department,
            status: employees.status,
            createdAt: employees.createdAt,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
          })
          .from(employees)
          .innerJoin(users, eq(employees.userId, users.id))
          .where(where)
          .limit(limit)
          .offset(offset)
          .orderBy(employees.createdAt),
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
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
        .values({ userId, department: body.department })
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

  // ── POST /:id/access ────────────────────────────────────────────
  .post(
    "/:id/access",
    async ({ params, body }) => {
      if (body.affiliateIds !== undefined) {
        await db
          .delete(employeeAffiliateAccess)
          .where(eq(employeeAffiliateAccess.employeeId, params.id))
        if (body.affiliateIds.length > 0) {
          await db
            .insert(employeeAffiliateAccess)
            .values(
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
          await db
            .insert(employeeAdvertiserAccess)
            .values(
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
