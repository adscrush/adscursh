import Elysia from "elysia"
import { requireAuth } from "../../middleware/auth.middleware.js"
import { db } from "../../lib/db.js"
import {
  listOffers,
  getOffer,
  createOffer,
  updateOffer,
  listLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  listOfferAffiliates,
  assignAffiliate,
  updateOfferAffiliate,
  bulkUpdateOfferAffiliates,
  generateTrackingUrl,
} from "./offers.service.js"
import {
  createOfferSchema,
  updateOfferSchema,
  createLandingPageSchema,
  updateLandingPageSchema,
  assignAffiliateSchema,
  updateOfferAffiliateSchema,
  bulkOfferAffiliateSchema,
} from "@adscrush/shared/validators/offer.validator"

export const offerRoutes = new Elysia({ prefix: "/api/offers" })
  .use(requireAuth)
  .get("/", async ({ query }) => {
    const result = await listOffers(db, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      search: query.search as string | undefined,
      status: query.status as string | undefined,
      advertiserId: query.advertiserId as string | undefined,
    })
    return { success: true, ...result }
  })
  .get("/:id", async ({ params, set }) => {
    const offer = await getOffer(db, params.id)
    if (!offer) {
      set.status = 404
      return { success: false, error: "Offer not found" }
    }
    return { success: true, data: offer }
  })
  .post("/", async ({ body, set }) => {
    const parsed = createOfferSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    try {
      const offer = await createOffer(db, parsed.data)
      set.status = 201
      return { success: true, data: offer }
    } catch (error) {
      set.status = 400
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create",
      }
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    const parsed = updateOfferSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const offer = await updateOffer(db, params.id, parsed.data)
    if (!offer) {
      set.status = 404
      return { success: false, error: "Offer not found" }
    }
    return { success: true, data: offer }
  })
  // Landing Pages
  .get("/:id/landing-pages", async ({ params }) => {
    const data = await listLandingPages(db, params.id)
    return { success: true, data }
  })
  .post("/:id/landing-pages", async ({ params, body, set }) => {
    const parsed = createLandingPageSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const lp = await createLandingPage(db, params.id, parsed.data)
    set.status = 201
    return { success: true, data: lp }
  })
  .put("/:id/landing-pages/:lpId", async ({ params, body, set }) => {
    const parsed = updateLandingPageSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const lp = await updateLandingPage(db, params.lpId, parsed.data)
    if (!lp) {
      set.status = 404
      return { success: false, error: "Landing page not found" }
    }
    return { success: true, data: lp }
  })
  .delete("/:id/landing-pages/:lpId", async ({ params }) => {
    await deleteLandingPage(db, params.lpId)
    return { success: true }
  })
  // Offer Affiliates
  .get("/:id/affiliates", async ({ params }) => {
    const data = await listOfferAffiliates(db, params.id)
    return { success: true, data }
  })
  .post("/:id/affiliates", async ({ params, body, set }) => {
    const parsed = assignAffiliateSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const oa = await assignAffiliate(db, params.id, parsed.data)
    set.status = 201
    return { success: true, data: oa }
  })
  .put("/:id/affiliates/:oaId", async ({ params, body, set }) => {
    const parsed = updateOfferAffiliateSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const oa = await updateOfferAffiliate(db, params.oaId, parsed.data)
    if (!oa) {
      set.status = 404
      return { success: false, error: "Assignment not found" }
    }
    return { success: true, data: oa }
  })
  .post("/:id/affiliates/bulk", async ({ params, body, set }) => {
    const parsed = bulkOfferAffiliateSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    await bulkUpdateOfferAffiliates(
      db,
      params.id,
      parsed.data.affiliateIds,
      parsed.data.status
    )
    return { success: true }
  })
  // Tracking URL
  .get("/:id/tracking-url", async ({ params, query }) => {
    const trackingDomain =
      (query.trackingDomain as string) ||
      process.env["TRACKING_URL"] ||
      "http://localhost:3002"
    const url = generateTrackingUrl({
      trackingDomain,
      offerId: params.id,
      affiliateId: query.affiliateId as string,
      landingPageId: query.landingPageId as string | undefined,
    })
    return { success: true, data: { url } }
  })
