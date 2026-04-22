import { Elysia } from "elysia"
import { createDatabase } from "@adscrush/db"
import env from "../env"
import { trackConversion } from "../services/conversion.service.js"
import { z } from "zod"

const db = createDatabase({ url: env.DATABASE_URL })

const ConversionSchema = z.object({
  tid: z.string().optional(),
  click_id: z.string().optional(),
  event: z.string().default("conversion"),
  payout: z.string().optional(),
  sale_amount: z.string().optional(),
  currency: z.string().optional(),
}).refine(data => data.tid || data.click_id, {
  message: "Either tid or click_id is required",
  path: ["tid"]
})

export const trackRoute = new Elysia().post(
  "/conversion/track",
  async ({ body, request, set }) => {
    const result = ConversionSchema.safeParse(body)
    
    if (!result.success) {
      set.status = 400
      return { success: false, error: "INVALID_PARAMETERS", details: result.error.format() }
    }

    const data = result.data
    const clickId = (data.tid || data.click_id)!

    try {
      const trackingResult = await trackConversion(db, {
        clickId,
        event: data.event,
        payout: data.payout,
        saleAmount: data.sale_amount,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      })

      if (!trackingResult.success) {
        set.status = 400
        return trackingResult
      }

      return trackingResult
    } catch (error) {
      console.error("Critical error in conversion tracking:", error)
      set.status = 500
      return { success: false, error: "TRACKING_ERROR", message: "Failed to track conversion" }
    }
  }
)
