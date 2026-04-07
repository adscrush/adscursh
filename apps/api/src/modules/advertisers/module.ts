import Elysia from "elysia"
import { eq, like, sql, and, type SQL } from "@adscrush/db/drizzle"
import { advertisers } from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { AppError } from "../../utils/errors"
import { requireAuth } from "../../middleware/auth.middleware"
import { listQuerySchema } from "./config"
import {
  createAdvertiserSchema,
  updateAdvertiserSchema,
} from "@adscrush/shared/validators/advertiser.schema"

export const advertiserRoutes = new Elysia({ prefix: "/advertisers" })
  .use(requireAuth)

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        accountManagerId,
      } = listQuerySchema.parse(query)
      const offset = (page - 1) * limit

      const conditions: SQL[] = []
      if (search) conditions.push(like(advertisers.name, `%${search}%`))
      if (status) conditions.push(eq(advertisers.status, status))
      if (accountManagerId)
        conditions.push(eq(advertisers.accountManagerId, accountManagerId))
      const where = conditions.length > 0 ? and(...conditions) : undefined

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(advertisers)
          .where(where)
          .limit(limit)
          .offset(offset)
          .orderBy(advertisers.createdAt),
        db
          .select({ count: sql<number>`count(*)` })
          .from(advertisers)
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

  // ── PUT /:id ───────────────────────────────────────────────────
  .put(
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

  // ── DELETE /:id ────────────────────────────────────────────────
  .delete("/:id", async ({ params }) => {
    const [deleted] = await db
      .delete(advertisers)
      .where(eq(advertisers.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Advertiser not found")
    return { success: true, data: { id: deleted.id } }
  })
