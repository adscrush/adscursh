import { eq, and } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import {
  clicks,
  conversions,
  offers,
  offerAffiliates,
} from "@adscrush/db/schema"

interface TrackConversionInput {
  clickId: string
  event?: string
  payout?: string
  saleAmount?: string
  currency?: string
  ipAddress?: string
  userAgent?: string
}

export async function trackConversion(
  db: Database,
  input: TrackConversionInput
) {
  const [click] = await db
    .select()
    .from(clicks)
    .where(eq(clicks.id, input.clickId))
    .limit(1)

  if (!click) {
    return { success: false, error: "Click not found" } as const
  }

  const [offer] = await db
    .select()
    .from(offers)
    .where(eq(offers.id, click.offerId))
    .limit(1)

  if (!offer) {
    return { success: false, error: "Offer not found" } as const
  }

  const event = input.event ?? "conversion"

  if (!offer.allowMultiConversion) {
    const [existing] = await db
      .select({ id: conversions.id })
      .from(conversions)
      .where(
        and(
          eq(conversions.clickId, input.clickId),
          eq(conversions.event, event)
        )
      )
      .limit(1)

    if (existing) {
      return {
        success: true,
        duplicate: true,
        conversionId: existing.id,
      } as const
    }
  }

  const [assignment] = await db
    .select()
    .from(offerAffiliates)
    .where(
      and(
        eq(offerAffiliates.offerId, click.offerId),
        eq(offerAffiliates.affiliateId, click.affiliateId)
      )
    )
    .limit(1)

  const payout =
    input.payout ?? assignment?.customPayout ?? offer.defaultPayout ?? "0"
  const revenue = assignment?.customRevenue ?? offer.defaultRevenue ?? "0"

  const conversionId = crypto.randomUUID()
  const [conversion] = await db
    .insert(conversions)
    .values({
      id: conversionId,
      clickId: input.clickId,
      offerId: click.offerId,
      affiliateId: click.affiliateId,
      advertiserId: click.advertiserId,
      event,
      payout,
      revenue,
      saleAmount: input.saleAmount,
      currency: input.currency ?? offer.currency,
      status: "approved",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    })
    .returning()

  return {
    success: true,
    duplicate: false,
    conversionId: conversion?.id ?? conversionId,
  } as const
}
