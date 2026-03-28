import { Elysia } from "elysia"
import { UAParser } from "ua-parser-js"
import { createDatabase } from "@adscrush/db"
import {
  validateOfferAndAffiliate,
  selectLandingPage,
  recordClick,
} from "../services/click.service.js"

const db = createDatabase({ url: process.env["DATABASE_URL"] })

export const clickRoute = new Elysia().get("/c", async ({ query, request, set }) => {
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
  const redirectUrl = new URL(redirectBase)
  redirectUrl.searchParams.set("click_id", clickId)

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
    source: (query.source as string) ?? null,
    redirectUrl: redirectUrl.toString(),
  })

  set.redirect = redirectUrl.toString()
  set.status = 302
})
