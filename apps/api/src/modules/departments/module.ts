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
import { departments } from "@adscrush/db/schema"
import { filterColumns, getColumn } from "@adscrush/db/lib/filter-columns"
import { db } from "~/lib/db"
import { AppError } from "~/utils/errors"
import { requireAuth } from "~/middleware/auth.middleware"
import { listQuerySchema } from "./config"
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  bulkUpdateStatusSchema as bulkUpdateDepartmentStatusSchema,
  bulkDeleteSchema as bulkDeleteDepartmentSchema,
} from "@adscrush/shared/validators/department.validator"

export const departmentRoutes = new Elysia({ prefix: "/departments" })
  .use(requireAuth)

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

      const advancedWhere = filterColumns({
        table: departments,
        filters,
        joinOperator,
        database: "postgres",
      })

      const simpleWhere =
        name || status.length > 0 || createdAt.length > 0
          ? and(
              name ? like(departments.name, `%${name}%`) : undefined,
              status.length > 0
                ? or(...status.map((s) => eq(departments.status, s)))
                : undefined,
              createdAt.length > 0
                ? and(
                    createdAt[0]
                      ? gte(
                          departments.createdAt,
                          (() => {
                            const d = new Date(createdAt[0])
                            d.setHours(0, 0, 0, 0)
                            return d
                          })()
                        )
                      : undefined,
                    createdAt[1]
                      ? lte(
                          departments.createdAt,
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
                ? desc(getColumn(departments, item.id))
                : asc(getColumn(departments, item.id))
            )
          : [asc(departments.createdAt)]

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: departments.id,
            name: departments.name,
            description: departments.description,
            status: departments.status,
            createdAt: departments.createdAt,
            updatedAt: departments.updatedAt,
          })
          .from(departments)
          .where(where)
          .limit(perPage)
          .offset(offset)
          .orderBy(...orderBy),
        db
          .select({ count: sql<number>`count(*)` })
          .from(departments)
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
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, params.id))
      .limit(1)
    if (!department) throw new AppError(404, "Department not found")
    return { success: true, data: department }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const [department] = await db.insert(departments).values(body).returning()
      return { success: true, data: department, status: 201 }
    },
    { body: createDepartmentSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const [department] = await db
        .update(departments)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(departments.id, params.id))
        .returning()
      if (!department) throw new AppError(404, "Department not found")
      return { success: true, data: department }
    },
    { body: updateDepartmentSchema }
  )

  // ── POST /:id/delete ──────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db
      .update(departments)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(departments.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Department not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── POST /bulk-status ───────────────────────────────────────────
  .post(
    "/bulk-status",
    async ({ body }) => {
      const { ids, status } = bulkUpdateDepartmentStatusSchema.parse(body)
      await db
        .update(departments)
        .set({ status, updatedAt: new Date() })
        .where(inArray(departments.id, ids))
      return { success: true }
    },
    { body: bulkUpdateDepartmentStatusSchema }
  )

  // ── POST /bulk-delete ───────────────────────────────────────────
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = bulkDeleteDepartmentSchema.parse(body)
      await db.delete(departments).where(inArray(departments.id, ids))
      return { success: true, data: { ids } }
    },
    { body: bulkDeleteDepartmentSchema }
  )
