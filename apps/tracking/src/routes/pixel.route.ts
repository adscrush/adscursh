import { Elysia } from "elysia"
import { createDatabase } from "@adscrush/db"
import env from "../env"
import { trackConversion } from "../services/conversion.service.js"

const db = createDatabase({ url: env.DATABASE_URL })

const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export const pixelRoute = new Elysia().get(
  "/conversion/pixel",
  async ({ query, request, set }) => {
    const clickId = (query.tid as string) || (query.click_id as string)

    if (clickId) {
      // Fire and forget conversion tracking to ensure pixel returns immediately
      trackConversion(db, {
        clickId,
        event: (query.event as string) ?? "conversion",
        payout: query.payout as string | undefined,
        saleAmount: query.sale_amount as string | undefined,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      }).catch(err => console.error("Pixel conversion track failed:", err))
    }

    set.headers["content-type"] = "image/gif"
    set.headers["cache-control"] = "no-cache, no-store, must-revalidate"
    return new Response(PIXEL_GIF)
  }
)
