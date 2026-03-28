import { eq, sql, and, gte, lte, type SQL } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import { clicks, conversions, offers, affiliates } from "@adscrush/db/schema"

interface ReportParams {
  dateFrom?: string
  dateTo?: string
  offerId?: string
  affiliateId?: string
  advertiserId?: string
}

export async function getOverview(db: Database, params: ReportParams) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const dateFrom = params.dateFrom
    ? new Date(params.dateFrom)
    : startOfMonth
  const dateTo = params.dateTo ? new Date(params.dateTo) : now

  const clickConditions: SQL[] = [
    gte(clicks.createdAt, dateFrom),
    lte(clicks.createdAt, dateTo),
  ]
  const convConditions: SQL[] = [
    gte(conversions.createdAt, dateFrom),
    lte(conversions.createdAt, dateTo),
  ]

  if (params.offerId) {
    clickConditions.push(eq(clicks.offerId, params.offerId))
    convConditions.push(eq(conversions.offerId, params.offerId))
  }
  if (params.affiliateId) {
    clickConditions.push(eq(clicks.affiliateId, params.affiliateId))
    convConditions.push(eq(conversions.affiliateId, params.affiliateId))
  }
  if (params.advertiserId) {
    clickConditions.push(eq(clicks.advertiserId, params.advertiserId))
    convConditions.push(eq(conversions.advertiserId, params.advertiserId))
  }

  const [clickStats, convStats] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(clicks)
      .where(and(...clickConditions)),
    db
      .select({
        count: sql<number>`count(*)`,
        totalRevenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
        totalPayout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
      })
      .from(conversions)
      .where(and(...convConditions)),
  ])

  const totalClicks = Number(clickStats[0]?.count ?? 0)
  const totalConversions = Number(convStats[0]?.count ?? 0)
  const totalRevenue = Number(convStats[0]?.totalRevenue ?? 0)
  const totalPayout = Number(convStats[0]?.totalPayout ?? 0)

  return {
    clicks: totalClicks,
    conversions: totalConversions,
    revenue: totalRevenue,
    payout: totalPayout,
    profit: totalRevenue - totalPayout,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
  }
}

export async function getPerformanceReport(
  db: Database,
  params: ReportParams & {
    groupBy?: "offer" | "affiliate" | "date"
    page?: number
    limit?: number
  }
) {
  const page = params.page ?? 1
  const limit = params.limit ?? 50
  const offset = (page - 1) * limit
  const groupBy = params.groupBy ?? "offer"

  const dateFrom = params.dateFrom
    ? new Date(params.dateFrom)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const dateTo = params.dateTo ? new Date(params.dateTo) : new Date()

  const conditions: SQL[] = [
    gte(clicks.createdAt, dateFrom),
    lte(clicks.createdAt, dateTo),
  ]
  if (params.offerId) conditions.push(eq(clicks.offerId, params.offerId))
  if (params.affiliateId) conditions.push(eq(clicks.affiliateId, params.affiliateId))

  const where = and(...conditions)

  if (groupBy === "offer") {
    const data = await db
      .select({
        groupKey: clicks.offerId,
        groupName: offers.name,
        clicks: sql<number>`count(distinct ${clicks.id})`,
        conversions: sql<number>`count(distinct ${conversions.id})`,
        revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
        payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
      })
      .from(clicks)
      .leftJoin(conversions, eq(clicks.id, conversions.clickId))
      .leftJoin(offers, eq(clicks.offerId, offers.id))
      .where(where)
      .groupBy(clicks.offerId, offers.name)
      .limit(limit)
      .offset(offset)

    return { data }
  }

  if (groupBy === "affiliate") {
    const data = await db
      .select({
        groupKey: clicks.affiliateId,
        groupName: affiliates.name,
        clicks: sql<number>`count(distinct ${clicks.id})`,
        conversions: sql<number>`count(distinct ${conversions.id})`,
        revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
        payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
      })
      .from(clicks)
      .leftJoin(conversions, eq(clicks.id, conversions.clickId))
      .leftJoin(affiliates, eq(clicks.affiliateId, affiliates.id))
      .where(where)
      .groupBy(clicks.affiliateId, affiliates.name)
      .limit(limit)
      .offset(offset)

    return { data }
  }

  // groupBy === "date"
  const data = await db
    .select({
      groupKey: sql<string>`date(${clicks.createdAt})`,
      clicks: sql<number>`count(distinct ${clicks.id})`,
      conversions: sql<number>`count(distinct ${conversions.id})`,
      revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
      payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
    })
    .from(clicks)
    .leftJoin(conversions, eq(clicks.id, conversions.clickId))
    .where(where)
    .groupBy(sql`date(${clicks.createdAt})`)
    .orderBy(sql`date(${clicks.createdAt})`)
    .limit(limit)
    .offset(offset)

  return { data }
}

export async function getConversionLog(
  db: Database,
  params: ReportParams & { page?: number; limit?: number }
) {
  const page = params.page ?? 1
  const limit = params.limit ?? 50
  const offset = (page - 1) * limit

  const conditions: SQL[] = []
  if (params.dateFrom) {
    conditions.push(gte(conversions.createdAt, new Date(params.dateFrom)))
  }
  if (params.dateTo) {
    conditions.push(lte(conversions.createdAt, new Date(params.dateTo)))
  }
  if (params.offerId) conditions.push(eq(conversions.offerId, params.offerId))
  if (params.affiliateId)
    conditions.push(eq(conversions.affiliateId, params.affiliateId))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: conversions.id,
        clickId: conversions.clickId,
        offerId: conversions.offerId,
        affiliateId: conversions.affiliateId,
        event: conversions.event,
        payout: conversions.payout,
        revenue: conversions.revenue,
        saleAmount: conversions.saleAmount,
        status: conversions.status,
        createdAt: conversions.createdAt,
        offerName: offers.name,
        affiliateName: affiliates.name,
      })
      .from(conversions)
      .leftJoin(offers, eq(conversions.offerId, offers.id))
      .leftJoin(affiliates, eq(conversions.affiliateId, affiliates.id))
      .where(where)
      .orderBy(sql`${conversions.createdAt} desc`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(conversions)
      .where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
