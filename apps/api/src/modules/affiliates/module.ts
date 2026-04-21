import { and, asc, desc, eq, gte, ilike, inArray, like, lte, or, sql } from "@adscrush/db/drizzle"
import { filterColumns, getColumn } from "@adscrush/db/lib/filter-columns"
import { affiliates, employees, users } from "@adscrush/db/schema"
import {
  bulkDeleteSchema as bulkDeleteAffiliateSchema,
  bulkUpdateStatusSchema as bulkUpdateAffiliateStatusSchema,
  createAffiliateSchema,
  updateAffiliateSchema,
} from "@adscrush/shared/validators/affiliate.validator"
import Elysia from "elysia"
import z from "zod"
import { db } from "~/lib/db"
import { requireAuth } from "~/middleware/auth.middleware"
import { AppError } from "~/utils/errors"
import { listQuerySchema } from "./config"

export const affiliateRoutes = new Elysia({ prefix: "/affiliates" })
  .use(requireAuth)

  // ── GET /search ────────────────────────────────────────────────
  .get(
    "/search",
    async ({ query: { q } }) => {
      const items = await db
        .select({
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
        })
        .from(affiliates)
        .where(
          q
            ? or(
                like(affiliates.name, `%${q}%`),
                like(affiliates.companyName, `%${q}%`),
                like(affiliates.email, `%${q}%`),
                like(affiliates.id, `%${q}%`)
              )
            : undefined
        )
        .limit(20)

      return {
        success: true,
        data: items,
      }
    },
    {
      query: z.object({
        q: z.string().optional().default(""),
      }),
    }
  )

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const parsed = listQuerySchema.parse(query)
      const { page, perPage, name, status, createdAt, joinOperator, sort, filters } = parsed

      const offset = (page - 1) * perPage

      const advancedWhere = filterColumns({
        table: affiliates,
        filters,
        joinOperator,
        database: "postgres",
      })

      const simpleWhere =
        name || status.length > 0 || createdAt.length > 0
          ? and(
              name
                ? or(
                    ilike(affiliates.name, `%${name}%`),
                    ilike(affiliates.companyName, `%${name}%`),
                    ilike(affiliates.email, `%${name}%`)
                  )
                : undefined,
              status.length > 0 ? or(...status.map((s) => eq(affiliates.status, s))) : undefined,
              createdAt.length > 0
                ? and(
                    createdAt[0]
                      ? gte(
                          affiliates.createdAt,
                          (() => {
                            const d = new Date(createdAt[0])
                            d.setHours(0, 0, 0, 0)
                            return d
                          })()
                        )
                      : undefined,
                    createdAt[1]
                      ? lte(
                          affiliates.createdAt,
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

      const where = and(advancedWhere, simpleWhere)

      const orderBy =
        sort.length > 0
          ? sort.map((item) => (item.desc ? desc(getColumn(affiliates, item.id)) : asc(getColumn(affiliates, item.id))))
          : [asc(affiliates.createdAt)]

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: affiliates.id,
            name: affiliates.name,
            companyName: affiliates.companyName,
            email: affiliates.email,
            status: affiliates.status,
            accountManagerId: affiliates.accountManagerId,
            createdAt: affiliates.createdAt,
            updatedAt: affiliates.updatedAt,
            accountManager: {
              id: employees.id,
              department: employees.department,
              status: employees.status,
              name: users.name,
              email: users.email,
              image: users.image,
            },
          })
          .from(affiliates)
          .leftJoin(employees, eq(affiliates.accountManagerId, employees.id))
          .leftJoin(users, eq(employees.userId, users.id))
          .where(where)
          .limit(perPage)
          .offset(offset)
          .orderBy(...orderBy),
        db
          .select({ count: sql<number>`count(*)` })
          .from(affiliates)
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
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, params.id)).limit(1)
    if (!affiliate) throw new AppError(404, "Affiliate not found")
    return { success: true, data: affiliate }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const [affiliate] = await db.insert(affiliates).values(body).returning()
      return { success: true, data: affiliate, status: 201 }
    },
    { body: createAffiliateSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const [affiliate] = await db
        .update(affiliates)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(affiliates.id, params.id))
        .returning()
      if (!affiliate) throw new AppError(404, "Affiliate not found")
      return { success: true, data: affiliate }
    },
    { body: updateAffiliateSchema }
  )

  // ── POST /:id/delete ────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db.delete(affiliates).where(eq(affiliates.id, params.id)).returning()
    if (!deleted) throw new AppError(404, "Affiliate not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── POST /bulk-status ───────────────────────────────────────────
  .post(
    "/bulk-status",
    async ({ body }) => {
      const { ids, status } = bulkUpdateAffiliateStatusSchema.parse(body)
      await db.update(affiliates).set({ status, updatedAt: new Date() }).where(inArray(affiliates.id, ids))
      return { success: true }
    },
    { body: bulkUpdateAffiliateStatusSchema }
  )

  // ── POST /bulk-delete ───────────────────────────────────────────
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = bulkDeleteAffiliateSchema.parse(body)
      await db.delete(affiliates).where(inArray(affiliates.id, ids))
      return { success: true, data: { ids } }
    },
    { body: bulkDeleteAffiliateSchema }
  )
