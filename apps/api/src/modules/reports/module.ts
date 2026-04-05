import Elysia from "elysia"
import { eq, sql, and, gte, lte, type SQL } from "@adscrush/db/drizzle"
import { clicks, conversions, offers, affiliates } from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { requireAuth } from "../../middleware/auth.middleware"
import { overviewQuerySchema, performanceQuerySchema, conversionLogQuerySchema } from "./config"

export const reportRoutes = new Elysia({ prefix: "/reports" })
  .use(requireAuth)

  // ── GET /overview ──────────────────────────────────────────────────────────
  .get("/overview", async ({ query }) => {
    const { dateFrom, dateTo, offerId, affiliateId, advertiserId } = overviewQuerySchema.parse(query)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const from = dateFrom ? new Date(dateFrom) : startOfMonth
    const to = dateTo ? new Date(dateTo) : now

    const clickConditions: SQL[] = [gte(clicks.createdAt, from), lte(clicks.createdAt, to)]
    const convConditions: SQL[] = [gte(conversions.createdAt, from), lte(conversions.createdAt, to)]
    if (offerId) { clickConditions.push(eq(clicks.offerId, offerId)); convConditions.push(eq(conversions.offerId, offerId)) }
    if (affiliateId) { clickConditions.push(eq(clicks.affiliateId, affiliateId)); convConditions.push(eq(conversions.affiliateId, affiliateId)) }
    if (advertiserId) { clickConditions.push(eq(clicks.advertiserId, advertiserId)); convConditions.push(eq(conversions.advertiserId, advertiserId)) }

    const [clickStats, convStats] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(clicks).where(and(...clickConditions)),
      db.select({
        count: sql<number>`count(*)`,
        totalRevenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
        totalPayout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
      }).from(conversions).where(and(...convConditions)),
    ])

    const totalClicks = Number(clickStats[0]?.count ?? 0)
    const totalConversions = Number(convStats[0]?.count ?? 0)
    const totalRevenue = Number(convStats[0]?.totalRevenue ?? 0)
    const totalPayout = Number(convStats[0]?.totalPayout ?? 0)

    return {
      success: true,
      data: {
        clicks: totalClicks,
        conversions: totalConversions,
        revenue: totalRevenue,
        payout: totalPayout,
        profit: totalRevenue - totalPayout,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      },
    }
  }, { query: overviewQuerySchema })

  // ── GET /performance ──────────────────────────────────────────────────────
  .get("/performance", async ({ query }) => {
    const { dateFrom, dateTo, offerId, affiliateId, groupBy = "offer", page = 1, limit = 50 } = performanceQuerySchema.parse(query)
    const offset = (page - 1) * limit

    const from = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const to = dateTo ? new Date(dateTo) : new Date()
    const conditions: SQL[] = [gte(clicks.createdAt, from), lte(clicks.createdAt, to)]
    if (offerId) conditions.push(eq(clicks.offerId, offerId))
    if (affiliateId) conditions.push(eq(clicks.affiliateId, affiliateId))
    const where = and(...conditions)

    if (groupBy === "offer") {
      const data = await db
        .select({
          groupKey: clicks.offerId, groupName: offers.name,
          clicks: sql<number>`count(distinct ${clicks.id})`,
          conversions: sql<number>`count(distinct ${conversions.id})`,
          revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
        })
        .from(clicks)
        .leftJoin(conversions, eq(clicks.id, conversions.clickId))
        .leftJoin(offers, eq(clicks.offerId, offers.id))
        .where(where).groupBy(clicks.offerId, offers.name).limit(limit).offset(offset)
      return { success: true, data }
    }

    if (groupBy === "affiliate") {
      const data = await db
        .select({
          groupKey: clicks.affiliateId, groupName: affiliates.name,
          clicks: sql<number>`count(distinct ${clicks.id})`,
          conversions: sql<number>`count(distinct ${conversions.id})`,
          revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
        })
        .from(clicks)
        .leftJoin(conversions, eq(clicks.id, conversions.clickId))
        .leftJoin(affiliates, eq(clicks.affiliateId, affiliates.id))
        .where(where).groupBy(clicks.affiliateId, affiliates.name).limit(limit).offset(offset)
      return { success: true, data }
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
      .groupBy(sql`date(${clicks.createdAt})`).orderBy(sql`date(${clicks.createdAt})`)
      .limit(limit).offset(offset)

    return { success: true, data }
  }, { query: performanceQuerySchema })

  // ── GET /conversions ──────────────────────────────────────────────────────
  .get("/conversions", async ({ query }) => {
    const { dateFrom, dateTo, offerId, affiliateId, page = 1, limit = 50 } = conversionLogQuerySchema.parse(query)
    const offset = (page - 1) * limit

    const conditions: SQL[] = []
    if (dateFrom) conditions.push(gte(conversions.createdAt, new Date(dateFrom)))
    if (dateTo) conditions.push(lte(conversions.createdAt, new Date(dateTo)))
    if (offerId) conditions.push(eq(conversions.offerId, offerId))
    if (affiliateId) conditions.push(eq(conversions.affiliateId, affiliateId))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [items, countResult] = await Promise.all([
      db.select({
        id: conversions.id, clickId: conversions.clickId, offerId: conversions.offerId,
        affiliateId: conversions.affiliateId, event: conversions.event, payout: conversions.payout,
        revenue: conversions.revenue, saleAmount: conversions.saleAmount, status: conversions.status,
        createdAt: conversions.createdAt,
        offerName: offers.name, affiliateName: affiliates.name,
      })
      .from(conversions)
      .leftJoin(offers, eq(conversions.offerId, offers.id))
      .leftJoin(affiliates, eq(conversions.affiliateId, affiliates.id))
      .where(where).orderBy(sql`${conversions.createdAt} desc`).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(conversions).where(where),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    return { success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }, { query: conversionLogQuerySchema })
