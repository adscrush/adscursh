import Elysia from "elysia"
import { requireAuth } from "../../middleware/auth.middleware"
import { db } from "../../lib/db"
import {
  listAffiliates,
  getAffiliate,
  createAffiliate,
  updateAffiliate,
} from "./affiliates.service"
import {
  createAffiliateSchema,
  updateAffiliateSchema,
} from "@adscrush/shared/validators/affiliate.validator"

export const affiliateRoutes = new Elysia({ prefix: "/api/affiliates" })
  .use(requireAuth)
  .get("/", async ({ query }) => {
    const result = await listAffiliates(db, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      search: query.search as string | undefined,
      status: query.status as string | undefined,
      accountManagerId: query.accountManagerId as string | undefined,
    })
    return { success: true, ...result }
  })
  .get("/:id", async ({ params, set }) => {
    const advertiser = await getAffiliate(db, params.id)
    if (!advertiser) {
      set.status = 404
      return { success: false, error: "Affiliate not found" }
    }
    return { success: true, data: advertiser }
  })
  .post("/", async ({ body, set }) => {
    const parsed = createAffiliateSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    try {
      const affiliate = await createAffiliate(db, parsed.data)
      set.status = 201
      return { success: true, data: affiliate }
    } catch (error) {
      set.status = 400
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create",
      }
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    const parsed = updateAffiliateSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const affiliate = await updateAffiliate(db, params.id, parsed.data)
    if (!affiliate) {
      set.status = 404
      return { success: false, error: "Affiliate not found" }
    }
    return { success: true, data: affiliate }
  })
