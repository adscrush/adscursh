import { Elysia } from "elysia"
import { UAParser } from "ua-parser-js"
import { createDatabase } from "@adscrush/db"
import {
  validateOfferAndAffiliate,
  selectLandingPage,
  recordClick,
} from "../services/click.service.js"

const db = createDatabase({ url: process.env["DATABASE_URL"] })

export const clickRoute = new Elysia().get(
  "/c",
  async ({ query, request, set }) => {
    const offerId = query.o as string
    const affiliateId = query.a as string

    if (!offerId || !affiliateId) {
      set.status = 400
      return "Missing required parameters: o (offer), a (affiliate)"
    }

    const validation = await validateOfferAndAffiliate(db, offerId, affiliateId)
    if (!validation.valid) {
      set.status = 404
      return validation.error
    }

    const landingPage = await selectLandingPage(
      db,
      offerId,
      query.lp as string | undefined
    )

    // Fallback to offer URL if no landing pages
    const redirectBase = landingPage?.url ?? validation.offer.offerUrl
    const clickId = crypto.randomUUID()

    // Parse User-Agent
    const userAgent = request.headers.get("user-agent") ?? ""
    const parser = new UAParser(userAgent)
    const uaResult = parser.getResult()

    // Get IP
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded
      ? forwarded.split(",")[0]?.trim()
      : request.headers.get("x-real-ip") ?? "unknown"

    // Build redirect URL
    let redirectUrlStr = redirectBase

    // Macro replacement
    const macros: Record<string, string> = {
      "{tid}": clickId,
      "{clickid}": clickId,
      "{aff_id}": affiliateId,
      "{offer_id}": offerId,
      "{sub1}": (query.aff_sub1 as string) ?? "",
      "{sub2}": (query.aff_sub2 as string) ?? "",
      "{sub3}": (query.aff_sub3 as string) ?? "",
      "{source}": (query.source as string) ?? "",
      "{campaign}": (query.campaign as string) ?? "",
    }

    Object.entries(macros).forEach(([macro, value]) => {
      redirectUrlStr = redirectUrlStr.replaceAll(macro, value)
    })

    const redirectUrl = new URL(redirectUrlStr)
    if (!redirectUrl.searchParams.has("click_id")) {
      redirectUrl.searchParams.set("click_id", clickId)
    }

    // Record click (fire and forget for speed, but await for Phase 1 correctness)
    await recordClick(db, {
      id: clickId,
      offerId,
      affiliateId,
      advertiserId: validation.offer.advertiserId,
      landingPageId: landingPage?.id ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent || null,
      referer: request.headers.get("referer") ?? null,
      deviceType: uaResult.device.type ?? "desktop",
      os: uaResult.os.name ?? null,
      browser: uaResult.browser.name ?? null,
      affClickId: (query.aff_click_id as string) ?? null,
      subAffId: (query.sub_aff_id as string) ?? null,
      affSub1: (query.aff_sub1 as string) ?? null,
      affSub2: (query.aff_sub2 as string) ?? null,
      affSub3: (query.aff_sub3 as string) ?? null,
      affSub4: (query.aff_sub4 as string) ?? null,
      affSub5: (query.aff_sub5 as string) ?? null,
      affSub6: (query.aff_sub6 as string) ?? null,
      affSub7: (query.aff_sub7 as string) ?? null,
      affSub8: (query.aff_sub8 as string) ?? null,
      affSub9: (query.aff_sub9 as string) ?? null,
      affSub10: (query.aff_sub10 as string) ?? null,
      source: (query.source as string) ?? null,
      campaign: (query.campaign as string) ?? null,
      redirectUrl: redirectUrl.toString(),
    })

    set.redirect = redirectUrl.toString()
    set.status = 302
  }
)
