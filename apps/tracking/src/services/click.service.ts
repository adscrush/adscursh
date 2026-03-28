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
    .where(and(eq(offers.id, offerId), eq(offers.status, "active")))
    .limit(1)

  if (!offer) return { valid: false, error: "Offer not found or inactive" } as const

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
    return { valid: false, error: "Affiliate not assigned or not approved" } as const

  return { valid: true, offer, assignment } as const
}

export async function selectLandingPage(
  db: Database,
  offerId: string,
  lpId?: string
) {
  if (lpId) {
    const [lp] = await db
      .select()
      .from(landingPages)
      .where(
        and(
          eq(landingPages.id, lpId),
          eq(landingPages.offerId, offerId),
          eq(landingPages.status, "active")
        )
      )
      .limit(1)
    return lp ?? null
  }

  // Weighted random selection
  const activeLps = await db
    .select()
    .from(landingPages)
    .where(
      and(
        eq(landingPages.offerId, offerId),
        eq(landingPages.status, "active")
      )
    )

  if (activeLps.length === 0) return null

  const totalWeight = activeLps.reduce((sum, lp) => sum + lp.weight, 0)
  let random = Math.random() * totalWeight
  for (const lp of activeLps) {
    random -= lp.weight
    if (random <= 0) return lp
  }

  return activeLps[0] ?? null
}

export async function recordClick(db: Database, click: NewClick) {
  const [inserted] = await db.insert(clicks).values(click).returning()
  return inserted
}
