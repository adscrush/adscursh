import Elysia from "elysia"
import { requireAuth } from "../../middleware/auth.middleware"
import { db } from "../../lib/db"
import {
  listAdvertisers,
  getAdvertiser,
  createAdvertiser,
  updateAdvertiser,
} from "./advertisers.service"
import {
  createAdvertiserSchema,
  updateAdvertiserSchema,
} from "@adscrush/shared/validators/advertiser.validator"

export const advertiserRoutes = new Elysia({ prefix: "/advertisers" })
  .use(requireAuth)
  .get("/", async ({ query }) => {
    const result = await listAdvertisers(db, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      search: query.search as string | undefined,
      status: query.status as string | undefined,
      accountManagerId: query.accountManagerId as string | undefined,
    })
    return { success: true, ...result }
  })
  .get("/:id", async ({ params, set }) => {
    const advertiser = await getAdvertiser(db, params.id)
    if (!advertiser) {
      set.status = 404
      return { success: false, error: "Advertiser not found" }
    }
    return { success: true, data: advertiser }
  })
  .post("/", async ({ body, set }) => {
    const parsed = createAdvertiserSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    try {
      const advertiser = await createAdvertiser(db, parsed.data)
      set.status = 201
      return { success: true, data: advertiser }
    } catch (error) {
      set.status = 400
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create",
      }
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    const parsed = updateAdvertiserSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const advertiser = await updateAdvertiser(db, params.id, parsed.data)
    if (!advertiser) {
      set.status = 404
      return { success: false, error: "Advertiser not found" }
    }
    return { success: true, data: advertiser }
  })
