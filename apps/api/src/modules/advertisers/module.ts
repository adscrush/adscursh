import Elysia from "elysia"
import {
  eq,
  like,
  sql,
  and,
  or,
  gte,
  lte,
  desc,
  asc,
  inArray,
} from "@adscrush/db/drizzle"
import { advertisers, employees, users } from "@adscrush/db/schema"
import { db } from "~/lib/db"
import { AppError } from "~/utils/errors"
import { requireAuth } from "~/middleware/auth.middleware"
import { listQuerySchema } from "./config"
import {
  createAdvertiserSchema,
  updateAdvertiserSchema,
  bulkUpdateStatusSchema,
  bulkDeleteSchema,
} from "@adscrush/shared/validators/advertiser.schema"
import { filterColumns, getColumn } from "@adscrush/db/lib/filter-columns"
import z from "zod"

export const advertiserRoutes = new Elysia({ prefix: "/advertisers" })
  .use(requireAuth)

  // ── GET /search ────────────────────────────────────────────────
  .get(
    "/search",
    async ({ query: { q } }) => {
      const items = await db
        .select({
          id: advertisers.id,
          name: advertisers.name,
          email: advertisers.email,
        })
        .from(advertisers)
        .where(
          q
            ? or(
                like(advertisers.name, `%${q}%`),
                like(advertisers.companyName, `%${q}%`),
                like(advertisers.email, `%${q}%`),
                like(advertisers.id, `%${q}%`)
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
        table: advertisers,
        filters,
        joinOperator,
        database: "postgres",
      })

      const simpleWhere =
        name || status.length > 0 || createdAt.length > 0
          ? and(
              name ? like(advertisers.name, `%${name}%`) : undefined,
              status.length > 0
                ? or(...status.map((s) => eq(advertisers.status, s)))
                : undefined,
              createdAt.length > 0
                ? and(
                    createdAt[0]
                      ? gte(
                          advertisers.createdAt,
                          (() => {
                            const d = new Date(createdAt[0])
                            d.setHours(0, 0, 0, 0)
                            return d
                          })()
                        )
                      : undefined,
                    createdAt[1]
                      ? lte(
                          advertisers.createdAt,
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
                ? desc(getColumn(advertisers, item.id))
                : asc(getColumn(advertisers, item.id))
            )
          : [asc(advertisers.createdAt)]

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: advertisers.id,
            name: advertisers.name,
            companyName: advertisers.companyName,
            email: advertisers.email,
            status: advertisers.status,
            accountManagerId: advertisers.accountManagerId,
            createdAt: advertisers.createdAt,
            updatedAt: advertisers.updatedAt,
            accountManager: {
              id: employees.id,
              department: employees.department,
              status: employees.status,
              name: users.name,
              email: users.email,
              image: users.image,
            },
          })
          .from(advertisers)
          .leftJoin(employees, eq(advertisers.accountManagerId, employees.id))
          .leftJoin(users, eq(employees.userId, users.id))
          .where(where)
          .limit(perPage)
          .offset(offset)
          .orderBy(...orderBy),
        db
          .select({ count: sql<number>`count(*)` })
          .from(advertisers)
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
    const [advertiser] = await db
      .select()
      .from(advertisers)
      .where(eq(advertisers.id, params.id))
      .limit(1)
    if (!advertiser) throw new AppError(404, "Advertiser not found")
    return { success: true, data: advertiser }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const [advertiser] = await db.insert(advertisers).values(body).returning()
      return { success: true, data: advertiser, status: 201 }
    },
    { body: createAdvertiserSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const [advertiser] = await db
        .update(advertisers)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(advertisers.id, params.id))
        .returning()
      if (!advertiser) throw new AppError(404, "Advertiser not found")
      return { success: true, data: advertiser }
    },
    { body: updateAdvertiserSchema }
  )

  // ── POST /:id/delete ──────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db
      .delete(advertisers)
      .where(eq(advertisers.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Advertiser not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── POST /bulk-status ─────────────────────────────────────────────
  .post(
    "/bulk-status",
    async ({ body }) => {
      const { ids, status } = bulkUpdateStatusSchema.parse(body)
      await db
        .update(advertisers)
        .set({ status, updatedAt: new Date() })
        .where(inArray(advertisers.id, ids))
      return { success: true }
    },
    { body: bulkUpdateStatusSchema }
  )

  // ── POST /bulk-delete ────────────────────────────────────────────
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = bulkDeleteSchema.parse(body)
      await db.delete(advertisers).where(inArray(advertisers.id, ids))
      return { success: true, data: { ids } }
    },
    { body: bulkDeleteSchema }
  )
