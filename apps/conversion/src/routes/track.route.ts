import { Elysia } from "elysia"
import { createDatabase } from "@adscrush/db"
import { trackConversion } from "../services/conversion.service.js"

const db = createDatabase({ url: process.env["DATABASE_URL"] })

export const trackRoute = new Elysia()
  .post("/conversion/track", async ({ body, request, set }) => {
    const data = body as {
      click_id?: string
      event?: string
      payout?: string
      sale_amount?: string
      currency?: string
    }

    if (!data.click_id) {
      set.status = 400
      return { success: false, error: "click_id is required" }
    }

    const result = await trackConversion(db, {
      clickId: data.click_id,
      event: data.event,
      payout: data.payout,
      saleAmount: data.sale_amount,
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    })

    if (!result.success) {
      set.status = 400
      return result
    }

    return result
  })
