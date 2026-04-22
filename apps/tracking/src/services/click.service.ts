import { eq, and } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import {
  offers,
  offerAffiliates,
  landingPages,
  clicks,
} from "@adscrush/db/schema"
import type { NewClick } from "@adscrush/db/schema"

export async function validateOfferAndAffiliate(
  db: Database,
  offerId: string,
  affiliateId: string
) {
  const [offer] = await db
    .select()
    .from(offers)
    .where(eq(offers.id, offerId))
    .limit(1)

  if (!offer) return { valid: false, error: "Offer not found" } as const

  if (offer.status !== "active") {
    return { valid: false, error: "Offer is inactive", offer } as const
  }

  const [assignment] = await db
    .select()
    .from(offerAffiliates)
    .where(
      and(
        eq(offerAffiliates.offerId, offerId),
        eq(offerAffiliates.affiliateId, affiliateId),
        eq(offerAffiliates.status, "approved")
      )
    )
    .limit(1)

  if (!assignment)
    return { valid: false, error: "Affiliate not assigned or not approved", offer } as const

  return { valid: true, offer, assignment } as const
}

export async function selectLandingPage(
  db: Database,
  offer: { id: string; offerUrl: string },
  lpId?: string
) {
  if (lpId) {
    const [lp] = await db
      .select()
      .from(landingPages)
      .where(
        and(
          eq(landingPages.id, lpId),
          eq(landingPages.offerId, offer.id),
          eq(landingPages.status, "active")
        )
      )
      .limit(1)
    return lp ?? null
  }

  // Pool includes active landing pages + the default offer URL
  const activeLps = await db
    .select()
    .from(landingPages)
    .where(
      and(
        eq(landingPages.offerId, offer.id),
        eq(landingPages.status, "active")
      )
    )

  // Treat the offer_url itself as a "Default Landing Page" with a weight (e.g., 100 or 1.0)
  // We'll give it a default weight if not specified, but usually offer_url is the fallback.
  // User wants it to be part of the selection.
  const selectionPool = [
    { id: "default", url: offer.offerUrl, weight: 100 }, // Default offer URL
    ...activeLps.map(lp => ({ id: lp.id, url: lp.url, weight: lp.weight }))
  ]

  const totalWeight = selectionPool.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight
  for (const item of selectionPool) {
    random -= item.weight
    if (random <= 0) return { id: item.id === "default" ? null : item.id, url: item.url }
  }

  return { id: null, url: offer.offerUrl }
}

export async function recordClick(db: Database, click: NewClick) {
  const [inserted] = await db.insert(clicks).values(click).returning()
  return inserted
}
