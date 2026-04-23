import { Elysia, t } from "elysia"
import { UAParser } from "ua-parser-js"
import geoip from "geoip-lite"
import { createDatabase } from "@adscrush/db"
import env from "../env"
import {
  validateOfferAndAffiliate,
  selectLandingPage,
  recordClick,
} from "../services/click.service.js"
import { z } from "zod"

const db = createDatabase({ url: env.DATABASE_URL })

const ClickQuerySchema = z.object({
  o: z.string().min(1, "Offer ID is required"),
  a: z.string().min(1, "Affiliate ID is required"),
  lp: z.string().optional(),
  aff_click_id: z.string().optional(),
  sub_aff_id: z.string().optional(),
  aff_sub1: z.string().optional(),
  aff_sub2: z.string().optional(),
  aff_sub3: z.string().optional(),
  aff_sub4: z.string().optional(),
  aff_sub5: z.string().optional(),
  aff_sub6: z.string().optional(),
  aff_sub7: z.string().optional(),
  aff_sub8: z.string().optional(),
  aff_sub9: z.string().optional(),
  aff_sub10: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
})

export const clickRoute = new Elysia().get(
  "/c",
  async ({ query, request, redirect }) => {
    const result = ClickQuerySchema.safeParse(query)
    
    if (!result.success) {
      console.error("Invalid click parameters:", result.error.format())
      return { error: "INVALID_PARAMETERS", message: "Missing required parameters o and a" }
    }

    const { o: offerId, a: affiliateId, lp: lpId } = result.data

    try {
      const validation = await validateOfferAndAffiliate(db, offerId, affiliateId)
      
      if (!validation.valid) {
        console.warn(`Click validation failed: ${validation.error} for offer=${offerId}, aff=${affiliateId}`)
        
        // Even if invalid, if we have the offer, redirect to its URL
        if ('offer' in validation && validation.offer?.offerUrl) {
           return redirect(validation.offer.offerUrl)
        }
        
        return { error: "VALIDATION_FAILED", message: validation.error }
      }

      const { offer } = validation

      const selected = await selectLandingPage(
        db,
        offer,
        lpId
      )

      const redirectBase = selected.url
      const landingPageId = selected.id
      const clickId = crypto.randomUUID()

      // Parse User-Agent
      const userAgent = request.headers.get("user-agent") ?? ""
      const parser = new UAParser(userAgent)
      const uaResult = parser.getResult()

      // Get IP and Geo
      const forwarded = request.headers.get("x-forwarded-for")
      const ipAddress = forwarded
        ? forwarded.split(",")[0]?.trim()
        : request.headers.get("x-real-ip") ?? "unknown"
      
      const geo = ipAddress && ipAddress !== "unknown" ? geoip.lookup(ipAddress) : null
      const countryCode = geo?.country ?? null

      // Build redirect URL
      let redirectUrlStr = redirectBase

      // Macro replacement
      const macros: Record<string, string> = {
        "{tid}": clickId,
        "{aff_id}": affiliateId,
        "{offer_id}": offerId,
        "{sub1}": result.data.aff_sub1 ?? "",
        "{sub2}": result.data.aff_sub2 ?? "",
        "{sub3}": result.data.aff_sub3 ?? "",
        "{source}": result.data.source ?? "",
        "{campaign}": result.data.campaign ?? "",
      }

      Object.entries(macros).forEach(([macro, value]) => {
        redirectUrlStr = redirectUrlStr.replaceAll(macro, value)
      })

      // Clean up multiple slashes or other URL issues that might occur during replacement
      try {
        // User requested: "only append parameter or token injection if i mention... it should not bydefault inject token"
        // We will NOT automatically set .searchParams.set("click_id", clickId) here.
        const finalRedirectUrl = redirectUrlStr

        // Record click (fire and forget for speed)
        recordClick(db, {
          id: clickId,
          offerId,
          affiliateId,
          advertiserId: offer.advertiserId,
          landingPageId: landingPageId,
          ipAddress: ipAddress ?? null,
          geoCountry: countryCode,
          userAgent: userAgent || null,
          referer: request.headers.get("referer") ?? null,
          deviceType: uaResult.device.type ?? "desktop",
          os: uaResult.os.name ?? null,
          browser: uaResult.browser.name ?? null,
          affClickId: result.data.aff_click_id ?? null,
          subAffId: result.data.sub_aff_id ?? null,
          affSub1: result.data.aff_sub1 ?? null,
          affSub2: result.data.aff_sub2 ?? null,
          affSub3: result.data.aff_sub3 ?? null,
          affSub4: result.data.aff_sub4 ?? null,
          affSub5: result.data.aff_sub5 ?? null,
          affSub6: result.data.aff_sub6 ?? null,
          affSub7: result.data.aff_sub7 ?? null,
          affSub8: result.data.aff_sub8 ?? null,
          affSub9: result.data.aff_sub9 ?? null,
          affSub10: result.data.aff_sub10 ?? null,
          source: result.data.source ?? null,
          campaign: result.data.campaign ?? null,
          redirectUrl: finalRedirectUrl,
        }).catch(err => console.error("Failed to record click:", err))

        return redirect(finalRedirectUrl)
      } catch (urlError) {
        console.error("Failed to construct final redirect URL:", redirectUrlStr, urlError)
        return redirect(offer.offerUrl)
      }
    } catch (error) {
      console.error("Critical error in click tracking:", error)
      return { error: "TRACKING_ERROR", message: "An error occurred during tracking" }
    }
  }
)
