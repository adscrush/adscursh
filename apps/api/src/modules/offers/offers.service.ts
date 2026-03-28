import { eq, like, sql, and, type SQL } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import {
  offers,
  landingPages,
  offerAffiliates,
  affiliates,
} from "@adscrush/db/schema"
import type {
  CreateOfferInput,
  UpdateOfferInput,
  CreateLandingPageInput,
  AssignAffiliateInput,
} from "@adscrush/shared/validators"

interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  advertiserId?: string
}

export async function listOffers(db: Database, params: ListParams) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const offset = (page - 1) * limit

  const conditions: SQL[] = []
  if (params.search) {
    conditions.push(like(offers.name, `%${params.search}%`))
  }
  if (params.status) {
    conditions.push(eq(offers.status, params.status))
  }
  if (params.advertiserId) {
    conditions.push(eq(offers.advertiserId, params.advertiserId))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(offers)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(offers.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(offers).where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getOffer(db: Database, id: string) {
  const result = await db
    .select()
    .from(offers)
    .where(eq(offers.id, id))
    .limit(1)

  if (!result[0]) return null

  const [lps, oaCount] = await Promise.all([
    db
      .select()
      .from(landingPages)
      .where(eq(landingPages.offerId, id))
      .orderBy(landingPages.createdAt),
    db
      .select({ count: sql<number>`count(*)` })
      .from(offerAffiliates)
      .where(eq(offerAffiliates.offerId, id)),
  ])

  return {
    ...result[0],
    landingPages: lps,
    affiliateCount: Number(oaCount[0]?.count ?? 0),
  }
}

export async function createOffer(db: Database, data: CreateOfferInput) {
  const [offer] = await db
    .insert(offers)
    .values({
      name: data.name,
      advertiserId: data.advertiserId,
      description: data.description,
      offerUrl: data.offerUrl,
      previewUrl: data.previewUrl || null,
      status: data.status,
      payoutType: data.payoutType,
      defaultPayout: data.defaultPayout,
      defaultRevenue: data.defaultRevenue,
      currency: data.currency,
      targetGeo: data.targetGeo,
      fallbackUrl: data.fallbackUrl || null,
      allowMultiConversion: data.allowMultiConversion,
    })
    .returning()

  return offer
}

export async function updateOffer(
  db: Database,
  id: string,
  data: UpdateOfferInput
) {
  const values: Record<string, unknown> = { updatedAt: new Date() }
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      values[key] = val
    }
  }

  const [offer] = await db
    .update(offers)
    .set(values)
    .where(eq(offers.id, id))
    .returning()

  return offer
}

// Landing Pages

export async function listLandingPages(db: Database, offerId: string) {
  return db
    .select()
    .from(landingPages)
    .where(eq(landingPages.offerId, offerId))
    .orderBy(landingPages.createdAt)
}

export async function createLandingPage(
  db: Database,
  offerId: string,
  data: CreateLandingPageInput
) {
  const [lp] = await db
    .insert(landingPages)
    .values({
      offerId,
      name: data.name,
      url: data.url,
      weight: data.weight,
      status: data.status,
    })
    .returning()

  return lp
}

export async function updateLandingPage(
  db: Database,
  id: string,
  data: Partial<CreateLandingPageInput>
) {
  const values: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) values[key] = val
  }

  const [lp] = await db
    .update(landingPages)
    .set(values)
    .where(eq(landingPages.id, id))
    .returning()

  return lp
}

export async function deleteLandingPage(db: Database, id: string) {
  await db.delete(landingPages).where(eq(landingPages.id, id))
}

// Offer Affiliates

export async function listOfferAffiliates(db: Database, offerId: string) {
  return db
    .select({
      id: offerAffiliates.id,
      offerId: offerAffiliates.offerId,
      affiliateId: offerAffiliates.affiliateId,
      status: offerAffiliates.status,
      customPayout: offerAffiliates.customPayout,
      customRevenue: offerAffiliates.customRevenue,
      createdAt: offerAffiliates.createdAt,
      affiliateName: affiliates.name,
      affiliateEmail: affiliates.email,
    })
    .from(offerAffiliates)
    .innerJoin(affiliates, eq(offerAffiliates.affiliateId, affiliates.id))
    .where(eq(offerAffiliates.offerId, offerId))
    .orderBy(offerAffiliates.createdAt)
}

export async function assignAffiliate(
  db: Database,
  offerId: string,
  data: AssignAffiliateInput
) {
  const [oa] = await db
    .insert(offerAffiliates)
    .values({
      offerId,
      affiliateId: data.affiliateId,
      status: data.status,
      customPayout: data.customPayout,
      customRevenue: data.customRevenue,
    })
    .onConflictDoNothing()
    .returning()

  return oa
}

export async function updateOfferAffiliate(
  db: Database,
  id: string,
  data: {
    status?: string
    customPayout?: string
    customRevenue?: string
  }
) {
  const values: Record<string, unknown> = {}
  if (data.status !== undefined) values["status"] = data.status
  if (data.customPayout !== undefined) values["customPayout"] = data.customPayout
  if (data.customRevenue !== undefined)
    values["customRevenue"] = data.customRevenue

  if (data.status === "approved") {
    values["approvedAt"] = new Date()
  }

  const [oa] = await db
    .update(offerAffiliates)
    .set(values)
    .where(eq(offerAffiliates.id, id))
    .returning()

  return oa
}

export async function bulkUpdateOfferAffiliates(
  db: Database,
  offerId: string,
  affiliateIds: string[],
  status: string
) {
  for (const affId of affiliateIds) {
    await db
      .update(offerAffiliates)
      .set({
        status,
        ...(status === "approved" ? { approvedAt: new Date() } : {}),
      })
      .where(
        and(
          eq(offerAffiliates.offerId, offerId),
          eq(offerAffiliates.affiliateId, affId)
        )
      )
  }
}

export function generateTrackingUrl(params: {
  trackingDomain: string
  offerId: string
  affiliateId: string
  landingPageId?: string
}) {
  const base = `${params.trackingDomain}/c`
  const searchParams = new URLSearchParams({
    o: params.offerId,
    a: params.affiliateId,
  })
  if (params.landingPageId) {
    searchParams.set("lp", params.landingPageId)
  }
  return `${base}?${searchParams.toString()}`
}
