import Elysia from "elysia"
import { eq, like, sql, and, desc, or, type SQL } from "@adscrush/db/drizzle"
import {
  offers,
  categories,
  advertisers,
  landingPages,
  offerAffiliates,
  affiliates,
} from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { AppError } from "../../utils/errors"
import { requireAuth } from "../../middleware/auth.middleware"
import { listQuerySchema, trackingUrlQuerySchema } from "./config"
import {
  createOfferSchema,
  updateOfferSchema,
  createLandingPageSchema,
  updateLandingPageSchema,
  assignAffiliateSchema,
  updateOfferAffiliateSchema,
  bulkOfferAffiliateSchema,
} from "@adscrush/shared/validators/offer.validator"

export const offerRoutes = new Elysia({ prefix: "/offers" })
  .use(requireAuth)

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      try {
        const {
          page,
          limit,
          search,
          status,
          advertiserId,
        } = listQuerySchema.parse(query)
        const offset = (page - 1) * limit

        const conditions: SQL[] = []
        if (search) conditions.push(like(offers.name, `%${search}%`))
        if (status) conditions.push(eq(offers.status, status))
        if (advertiserId) conditions.push(eq(offers.advertiserId, advertiserId))
        const where = conditions.length > 0 ? and(...conditions) : undefined

        const [items, countResult] = await Promise.all([
          db
            .select({
              id: offers.id,
              name: offers.name,
              status: offers.status,
              advertiserId: offers.advertiserId,
              advertiserName: advertisers.name,
              categoryId: offers.categoryId,
              categoryName: categories.name,
              createdAt: offers.createdAt,
              updatedAt: offers.updatedAt,
            })
            .from(offers)
            .leftJoin(advertisers, eq(offers.advertiserId, advertisers.id))
            .leftJoin(categories, eq(offers.categoryId, categories.id))
            .where(where)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(offers.createdAt)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(offers)
            .where(where),
        ])

        const total = Number(countResult[0]?.count ?? 0)
        return {
          success: true,
          data: items,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        }
      } catch (e: any) {
        console.error("Error in GET /offers:", e)
        throw e
      }
    },
    { query: listQuerySchema }
  )

  // ── GET /:id ───────────────────────────────────────────────────
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(offers)
      .where(eq(offers.id, params.id))
      .limit(1)
    if (!result) throw new AppError(404, "Offer not found")

    const [lps, oaCount] = await Promise.all([
      db
        .select()
        .from(landingPages)
        .where(eq(landingPages.offerId, params.id))
        .orderBy(desc(landingPages.createdAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(offerAffiliates)
        .where(eq(offerAffiliates.offerId, params.id)),
    ])

    return {
      success: true,
      data: {
        ...result,
        landingPages: lps,
        affiliateCount: Number(oaCount[0]?.count ?? 0),
      },
    }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const [offer] = await db.insert(offers).values(body).returning()
      return { success: true, data: offer, status: 201 }
    },
    { body: createOfferSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const [offer] = await db
        .update(offers)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(offers.id, params.id))
        .returning()
      if (!offer) throw new AppError(404, "Offer not found")
      return { success: true, data: offer }
    },
    { body: updateOfferSchema }
  )

  // ── POST /:id/delete ────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db
      .delete(offers)
      .where(eq(offers.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Offer not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── Landing Pages ──────────────────────────────────────────────
  .get("/:id/landing-pages", async ({ params }) => {
    const lps = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.offerId, params.id))
      .orderBy(desc(landingPages.createdAt))
    return { success: true, data: lps }
  })

  .post(
    "/:id/landing-pages",
    async ({ params, body }) => {
      const [lp] = await db
        .insert(landingPages)
        .values({ ...body, offerId: params.id })
        .returning()
      return { success: true, data: lp, status: 201 }
    },
    { body: createLandingPageSchema }
  )

  .post(
    "/:id/landing-pages/:lpId",
    async ({ params, body }) => {
      const [lp] = await db
        .update(landingPages)
        .set(body)
        .where(eq(landingPages.id, params.lpId))
        .returning()
      if (!lp) throw new AppError(404, "Landing page not found")
      return { success: true, data: lp }
    },
    { body: updateLandingPageSchema }
  )

  .post("/:id/landing-pages/:lpId/delete", async ({ params }) => {
    await db.delete(landingPages).where(eq(landingPages.id, params.lpId))
    return { success: true }
  })

  // ── Offer Affiliates ───────────────────────────────────────────
  .get("/:id/affiliates", async ({ params }) => {
    const data = await db
      .select({
        id: offerAffiliates.id,
        offerId: offerAffiliates.offerId,
        affiliateId: offerAffiliates.affiliateId,
        status: offerAffiliates.status,
        customPayout: offerAffiliates.customPayout,
        customRevenue: offerAffiliates.customRevenue,
        createdAt: offerAffiliates.createdAt,
        affiliateName: affiliates.name,
        affiliateEmail: affiliates.email,
      })
      .from(offerAffiliates)
      .innerJoin(affiliates, eq(offerAffiliates.affiliateId, affiliates.id))
      .where(eq(offerAffiliates.offerId, params.id))
      .orderBy(desc(offerAffiliates.createdAt))
    return { success: true, data }
  })

  .post(
    "/:id/affiliates",
    async ({ params, body }) => {
      const [oa] = await db
        .insert(offerAffiliates)
        .values({ offerId: params.id, ...body })
        .onConflictDoNothing()
        .returning()
      return { success: true, data: oa, status: 201 }
    },
    { body: assignAffiliateSchema }
  )

  .post(
    "/:id/affiliates/:oaId",
    async ({ params, body }) => {
      const values: Record<string, unknown> = body
      if (body.status === "approved") values["approvedAt"] = new Date()
      const [oa] = await db
        .update(offerAffiliates)
        .set(values)
        .where(eq(offerAffiliates.id, params.oaId))
        .returning()
      if (!oa) throw new AppError(404, "Assignment not found")
      return { success: true, data: oa }
    },
    { body: updateOfferAffiliateSchema }
  )

  .post(
    "/:id/affiliates/bulk",
    async ({ params, body }) => {
      for (const affId of body.affiliateIds) {
        await db
          .update(offerAffiliates)
          .set({
            status: body.status,
            ...(body.status === "approved" ? { approvedAt: new Date() } : {}),
          })
          .where(
            and(
              eq(offerAffiliates.offerId, params.id),
              eq(offerAffiliates.affiliateId, affId)
            )
          )
      }
      return { success: true }
    },
    { body: bulkOfferAffiliateSchema }
  )

  // ── Tracking URL ───────────────────────────────────────────────
  .get(
    "/:id/tracking-url",
    async ({ params, query }) => {
      const {
        trackingDomain: td,
        affiliateId,
        landingPageId,
      } = trackingUrlQuerySchema.parse(query)
      const trackingDomain =
        td || process.env["TRACKING_URL"] || "http://localhost:3002"
      const base = `${trackingDomain}/c`
      const searchParams = new URLSearchParams({ o: params.id, a: affiliateId })
      if (landingPageId) searchParams.set("lp", landingPageId)
      return {
        success: true,
        data: { url: `${base}?${searchParams.toString()}` },
      }
    },
    { query: trackingUrlQuerySchema }
  )
