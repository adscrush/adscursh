import Elysia from "elysia"
import { eq, like, sql, and, type SQL } from "@adscrush/db/drizzle"
import { affiliates } from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { AppError } from "../../utils/errors"
import { requireAuth } from "../../middleware/auth.middleware"
import { listQuerySchema } from "./config"
import { createAffiliateSchema, updateAffiliateSchema } from "@adscrush/shared/validators/affiliate.validator"

export const affiliateRoutes = new Elysia({ prefix: "/affiliates" })
  .use(requireAuth)

  // ── GET / ──────────────────────────────────────────────────────
  .get("/", async ({ query }) => {
    const { page = 1, limit = 20, search, status, accountManagerId } = listQuerySchema.parse(query)
    const offset = (page - 1) * limit

    const conditions: SQL[] = []
    if (search) conditions.push(like(affiliates.name, `%${search}%`))
    if (status) conditions.push(eq(affiliates.status, status))
    if (accountManagerId) conditions.push(eq(affiliates.accountManagerId, accountManagerId))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [items, countResult] = await Promise.all([
      db.select().from(affiliates).where(where).limit(limit).offset(offset).orderBy(affiliates.createdAt),
      db.select({ count: sql<number>`count(*)` }).from(affiliates).where(where),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    return { success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }, { query: listQuerySchema })

  // ── GET /:id ───────────────────────────────────────────────────
  .get("/:id", async ({ params }) => {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, params.id)).limit(1)
    if (!affiliate) throw new AppError(404, "Affiliate not found")
    return { success: true, data: affiliate }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post("/", async ({ body }) => {
    const [affiliate] = await db.insert(affiliates).values(body).returning()
    return { success: true, data: affiliate, status: 201 }
  }, { body: createAffiliateSchema })

  // ── PUT /:id ───────────────────────────────────────────────────
  .put("/:id", async ({ params, body }) => {
    const [affiliate] = await db.update(affiliates)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(affiliates.id, params.id)).returning()
    if (!affiliate) throw new AppError(404, "Affiliate not found")
    return { success: true, data: affiliate }
  }, { body: updateAffiliateSchema })
