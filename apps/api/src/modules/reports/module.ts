import Elysia from "elysia"
import { eq, sql, and, gte, lte, type SQL, desc } from "@adscrush/db/drizzle"
import { clicks, conversions, offers, affiliates, categories, landingPages } from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { requireAuth } from "../../middleware/auth.middleware"
import { overviewQuerySchema, performanceQuerySchema, conversionLogQuerySchema, dashboardQuerySchema } from "./config"

function getDateRangeFromPeriod(period: string, customFrom?: string, customTo?: string) {
  const now = new Date()
  const to = customTo ? new Date(customTo) : now
  let from: Date

  const msPerDay = 24 * 60 * 60 * 1000
  switch (period) {
    case "1w":
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 7 * msPerDay)
      break
    case "1m":
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * msPerDay)
      break
    case "3m":
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 90 * msPerDay)
      break
    case "12m":
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 365 * msPerDay)
      break
    case "custom":
    default:
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * msPerDay)
      break
  }

  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  return { from, to }
}

function getPreviousPeriod(currentFrom: Date, currentTo: Date): { from: Date; to: Date } {
  const durationMs = currentTo.getTime() - currentFrom.getTime()
  const prevTo = new Date(currentFrom.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - durationMs)
  return { from: prevFrom, to: prevTo }
}

export const reportRoutes = new Elysia({ prefix: "/reports" })
  .use(requireAuth)

  // ── GET /overview ──────────────────────────────────────────────────────────
  .get(
    "/overview",
    async ({ query }) => {
      const { dateFrom, dateTo, offerId, affiliateId, advertiserId } = overviewQuerySchema.parse(query)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const from = dateFrom ? new Date(dateFrom) : startOfMonth
      const to = dateTo ? new Date(dateTo) : now

      const clickConditions: SQL[] = [gte(clicks.createdAt, from), lte(clicks.createdAt, to)]
      const convConditions: SQL[] = [gte(conversions.createdAt, from), lte(conversions.createdAt, to)]
      if (offerId) {
        clickConditions.push(eq(clicks.offerId, offerId))
        convConditions.push(eq(conversions.offerId, offerId))
      }
      if (affiliateId) {
        clickConditions.push(eq(clicks.affiliateId, affiliateId))
        convConditions.push(eq(conversions.affiliateId, affiliateId))
      }
      if (advertiserId) {
        clickConditions.push(eq(clicks.advertiserId, advertiserId))
        convConditions.push(eq(conversions.advertiserId, advertiserId))
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
    },
    { query: overviewQuerySchema }
  )

  // ── GET /stats/mtd ────────────────────────────────────────────────────────
  .get(
    "/stats/mtd",
    async ({ query }) => {
      const { offerId, affiliateId, advertiserId } = overviewQuerySchema.parse(query)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      const conditions: SQL[] = [gte(clicks.createdAt, startOfMonth), lte(clicks.createdAt, endOfMonth)]
      if (offerId) conditions.push(eq(clicks.offerId, offerId))
      if (affiliateId) conditions.push(eq(clicks.affiliateId, affiliateId))
      if (advertiserId) conditions.push(eq(offers.advertiserId, advertiserId))

      const where = and(...conditions)

      const dailyData = await db
        .select({
          date: sql<string>`date(${clicks.createdAt})::text`,
          clicks: sql<number>`count(distinct ${clicks.id})`,
          conversions: sql<number>`count(distinct ${conversions.id})`,
          revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
        })
        .from(clicks)
        .leftJoin(conversions, eq(clicks.id, conversions.clickId))
        .leftJoin(offers, eq(clicks.offerId, offers.id))
        .where(where)
        .groupBy(sql`date(${clicks.createdAt})`)
        .orderBy(sql`date(${clicks.createdAt})`)

      // Totals
      const totals = dailyData.reduce((acc, curr) => ({
        clicks: acc.clicks + Number(curr.clicks),
        conversions: acc.conversions + Number(curr.conversions),
        revenue: acc.revenue + Number(curr.revenue),
        payout: acc.payout + Number(curr.payout),
      }), { clicks: 0, conversions: 0, revenue: 0, payout: 0 })

      return {
        success: true,
        data: {
          totals,
          trend: dailyData.map(d => ({
            date: d.date,
            clicks: Number(d.clicks),
            conversions: Number(d.conversions),
            revenue: Number(d.revenue),
            payout: Number(d.payout),
          }))
        }
      }
    },
    { query: overviewQuerySchema }
  )

  // ── GET /performance ──────────────────────────────────────────────────────
  .get(
    "/performance",
    async ({ query }) => {
      const {
        dateFrom,
        dateTo,
        offerId,
        affiliateId,
        advertiserId,
        status,
        groupBy = "daily",
        page = 1,
        limit = 50,
      } = performanceQuerySchema.parse(query)
      const offset = (page - 1) * limit

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const from = dateFrom ? new Date(dateFrom) : startOfMonth
      let to = dateTo ? new Date(dateTo) : now

      // If dateTo is just a date string (YYYY-MM-DD), ensure it includes the full day
      if (dateTo && !dateTo.includes("T")) {
        to.setHours(23, 59, 59, 999)
      }

      const conditions: SQL[] = [gte(clicks.createdAt, from), lte(clicks.createdAt, to)]
      
      if (offerId) conditions.push(eq(clicks.offerId, offerId))
      if (affiliateId) conditions.push(eq(clicks.affiliateId, affiliateId))
      if (advertiserId) conditions.push(eq(offers.advertiserId, advertiserId))
      if (status) conditions.push(eq(offers.status, status as any))

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
        return { success: true, data }
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
        return { success: true, data }
      }

      if (groupBy === "landing_page") {
        const data = await db
          .select({
            groupKey: sql<string>`coalesce(${clicks.landingPageId}, 'default_offer_url')`,
            groupName: sql<string>`coalesce(${landingPages.name}, 'default_offer_url')`,
            clicks: sql<number>`count(distinct ${clicks.id})`,
            conversions: sql<number>`count(distinct ${conversions.id})`,
            revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
            payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
          })
          .from(clicks)
          .leftJoin(conversions, eq(clicks.id, conversions.clickId))
          .leftJoin(landingPages, eq(clicks.landingPageId, landingPages.id))
          .where(where)
          .groupBy(sql`coalesce(${clicks.landingPageId}, 'default_offer_url')`, landingPages.name)
          .limit(limit)
          .offset(offset)
        return { success: true, data }
      }

      if (groupBy === "detailed") {
        const data = await db
          .select({
            offerId: offers.id,
            offerName: offers.name,
            affiliateId: affiliates.id,
            affiliateName: affiliates.name,
            lpId: sql<string>`coalesce(${clicks.landingPageId}, 'default_offer_url')`,
            lpName: sql<string>`coalesce(${landingPages.name}, 'default_offer_url')`,
            country: clicks.geoCountry,
            clicks: sql<number>`count(distinct ${clicks.id})`,
            conversions: sql<number>`count(distinct ${conversions.id})`,
            revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
            payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
          })
          .from(clicks)
          .innerJoin(offers, eq(clicks.offerId, offers.id))
          .innerJoin(affiliates, eq(clicks.affiliateId, affiliates.id))
          .leftJoin(conversions, eq(clicks.id, conversions.clickId))
          .leftJoin(landingPages, eq(clicks.landingPageId, landingPages.id))
          .where(where)
          .groupBy(
            offers.id, 
            offers.name, 
            affiliates.id, 
            affiliates.name, 
            sql`coalesce(${clicks.landingPageId}, 'default_offer_url')`,
            landingPages.name,
            clicks.geoCountry
          )
          .limit(limit)
          .offset(offset)
        return { success: true, data }
      }

      if (groupBy === "date" || groupBy === "daily") {
        const data = await db
          .select({
            groupKey: sql<string>`date(${clicks.createdAt})::text`,
            clicks: sql<number>`count(distinct ${clicks.id})`,
            conversions: sql<number>`count(distinct ${conversions.id})`,
            revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
            payout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
          })
          .from(clicks)
          .leftJoin(conversions, eq(clicks.id, conversions.clickId))
          .leftJoin(offers, eq(clicks.offerId, offers.id))
          .where(where)
          .groupBy(sql`date(${clicks.createdAt})`)
          .orderBy(sql`date(${clicks.createdAt})`)
          .limit(limit)
          .offset(offset)

        return { success: true, data }
      }

      return { success: true, data: [] }
    },
    { query: performanceQuerySchema }
  )

  // ── GET /conversions ──────────────────────────────────────────────────────
  .get(
    "/conversions",
    async ({ query }) => {
      const { dateFrom, dateTo, offerId, affiliateId, page = 1, limit = 50 } = conversionLogQuerySchema.parse(query)
      const offset = (page - 1) * limit

      const conditions: SQL[] = []
      if (dateFrom) conditions.push(gte(conversions.createdAt, new Date(dateFrom)))
      if (dateTo) conditions.push(lte(conversions.createdAt, new Date(dateTo)))
      if (offerId) conditions.push(eq(conversions.offerId, offerId))
      if (affiliateId) conditions.push(eq(conversions.affiliateId, affiliateId))
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
            landingPageName: sql<string>`coalesce(${landingPages.name}, 'default_offer_url')`,
          })
          .from(conversions)
          .leftJoin(offers, eq(conversions.offerId, offers.id))
          .leftJoin(affiliates, eq(conversions.affiliateId, affiliates.id))
          .leftJoin(clicks, eq(conversions.clickId, clicks.id))
          .leftJoin(landingPages, eq(clicks.landingPageId, landingPages.id))
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
      return { success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    },
    { query: conversionLogQuerySchema }
  )

  // ── GET /dashboard ─────────────────────────────────────────────────────────
  .get(
    "/dashboard",
    async ({ query }) => {
      const { period, dateFrom: customFrom, dateTo: customTo } = dashboardQuerySchema.parse(query)
      const now = new Date()

      // Resolve date range for charts and general metrics
      const { from: dateFrom, to: dateTo } = getDateRangeFromPeriod(period, customFrom, customTo)
      const { from: prevDateFrom, to: prevDateTo } = getPreviousPeriod(dateFrom, dateTo)

      // Resolve "Today" and "Yesterday" for summary cards and active offers list
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)

      const yesterdayStart = new Date(todayStart)
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)
      const yesterdayEnd = new Date(todayEnd)
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

      // ── A) Summary metrics for TODAY (Snapshot) ─────────────────────────────
      const summaryResult = await db
        .select({
          activeOffers: sql<number>`count(DISTINCT ${offers.id})`,
          totalClicks: sql<number>`count(DISTINCT ${clicks.id})`,
          totalConversions: sql<number>`count(DISTINCT ${conversions.id})`,
          totalRevenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          totalPayout: sql<string>`coalesce(sum(${conversions.payout}), 0)`,
        })
        .from(offers)
        .innerJoin(
          clicks,
          and(eq(clicks.offerId, offers.id), gte(clicks.createdAt, todayStart), lte(clicks.createdAt, todayEnd))
        )
        .leftJoin(
          conversions,
          and(
            eq(conversions.clickId, clicks.id),
            gte(conversions.createdAt, todayStart),
            lte(conversions.createdAt, todayEnd)
          )
        )
        .where(
          and(
            eq(offers.status, "active"),
            sql`(${offers.startDate} IS NULL OR ${offers.startDate} <= NOW())`,
            sql`(${offers.endDate} IS NULL OR ${offers.endDate} >= NOW())`
          )
        )

      const summaryRow = (summaryResult[0] ?? {}) as any
      const totalRevenue = Number(summaryRow.totalRevenue ?? 0)
      const totalPayout = Number(summaryRow.totalPayout ?? 0)
      const totalClicks = Number(summaryRow.totalClicks ?? 0)
      const totalConversions = Number(summaryRow.totalConversions ?? 0)
      const activeOffers = Number(summaryRow.activeOffers ?? 0)
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

      // ── B) Yesterday metrics for trends ──────────────────────────────
      const prevResult = await db
        .select({
          prevRevenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          prevClicks: sql<number>`count(DISTINCT ${clicks.id})`,
          prevConversions: sql<number>`count(DISTINCT ${conversions.id})`,
          prevActiveOffers: sql<number>`count(DISTINCT ${offers.id})`,
        })
        .from(offers)
        .innerJoin(
          clicks,
          and(
            eq(clicks.offerId, offers.id),
            gte(clicks.createdAt, yesterdayStart),
            lte(clicks.createdAt, yesterdayEnd)
          )
        )
        .leftJoin(
          conversions,
          and(
            eq(conversions.clickId, clicks.id),
            gte(conversions.createdAt, yesterdayStart),
            lte(conversions.createdAt, yesterdayEnd)
          )
        )
        .where(
          and(
            eq(offers.status, "active"),
            sql`(${offers.startDate} IS NULL OR ${offers.startDate} <= NOW())`,
            sql`(${offers.endDate} IS NULL OR ${offers.endDate} >= NOW())`
          )
        )

      const prevRow = (prevResult[0] ?? {}) as any
      const prevRevenue = Number(prevRow.prevRevenue ?? 0)
      const prevClicks = Number(prevRow.prevClicks ?? 0)
      const prevConversions = Number(prevRow.prevConversions ?? 0)
      const prevActiveOffers = Number(prevRow.prevActiveOffers ?? 0)

      // ── C) Revenue time series ───────────────────────────────────────────────
      const useDailyGrouping = period === "1w"
      const groupByExpr = useDailyGrouping
        ? sql<string>`date_trunc('day', ${clicks.createdAt})`
        : sql<string>`date_trunc('month', ${clicks.createdAt})`

      const rawRevenueSeries = await db
        .select({
          period: groupByExpr,
          revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          clicks: sql<number>`count(DISTINCT ${clicks.id})`,
          conversions: sql<number>`count(DISTINCT ${conversions.id})`,
        })
        .from(offers)
        .innerJoin(
          clicks,
          and(eq(clicks.offerId, offers.id), gte(clicks.createdAt, dateFrom), lte(clicks.createdAt, dateTo))
        )
        .leftJoin(
          conversions,
          and(
            eq(conversions.clickId, clicks.id),
            gte(conversions.createdAt, dateFrom),
            lte(conversions.createdAt, dateTo)
          )
        )
        .where(
          and(
            eq(offers.status, "active"),
            sql`(${offers.startDate} IS NULL OR ${offers.startDate} <= NOW())`,
            sql`(${offers.endDate} IS NULL OR ${offers.endDate} >= NOW())`
          )
        )
        .groupBy(groupByExpr)
        .orderBy(groupByExpr)

      // Post-process to ensure we show all 12 months for 12m period
      let revenueByPeriod = rawRevenueSeries.map((row) => ({
        period: row.period as string,
        revenue: Number(row.revenue ?? 0),
        clicks: Number(row.clicks ?? 0),
        conversions: Number(row.conversions ?? 0),
      }))

      if (period === "12m") {
        const backfilled: typeof revenueByPeriod = []
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const iso = d.toISOString().split("T")[0]!
          const existing = revenueByPeriod.find((r) => {
            const rDate = new Date(r.period)
            return rDate.getFullYear() === d.getFullYear() && rDate.getMonth() === d.getMonth()
          })
          if (existing) {
            backfilled.push(existing)
          } else {
            backfilled.push({
              period: iso,
              revenue: 0,
              clicks: 0,
              conversions: 0,
            })
          }
        }
        revenueByPeriod = backfilled
      }

      // ── D) Customer segments (top 3 categories) ─────────────────────────────
      const segmentsResult = await db
        .select({
          segment: categories.name,
          count: sql<number>`count(DISTINCT ${conversions.id})`,
        })
        .from(conversions)
        .innerJoin(clicks, eq(conversions.clickId, clicks.id))
        .innerJoin(offers, eq(clicks.offerId, offers.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(gte(conversions.createdAt, dateFrom), lte(conversions.createdAt, dateTo), eq(offers.status, "active"))
        )
        .groupBy(categories.id, categories.name)
        .orderBy(desc(sql`count(DISTINCT ${conversions.id})`))
        .limit(3)

      // Previous period segment counts
      const prevSegmentsResult = await db
        .select({
          segment: categories.name,
          count: sql<number>`count(DISTINCT ${conversions.id})`,
        })
        .from(conversions)
        .innerJoin(clicks, eq(conversions.clickId, clicks.id))
        .innerJoin(offers, eq(clicks.offerId, offers.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(
            gte(conversions.createdAt, prevDateFrom),
            lte(conversions.createdAt, prevDateTo),
            eq(offers.status, "active")
          )
        )
        .groupBy(categories.id, categories.name)

      const prevCounts = new Map<string, number>()
      prevSegmentsResult.forEach((row: any) => {
        if (row.segment) prevCounts.set(row.segment, Number(row.count ?? 0))
      })

      const totalConvForShare = (segmentsResult as any[]).reduce(
        (sum: number, row: any) => sum + Number(row.count ?? 0),
        0
      )

      const grayscale = ["#9CA3AF", "#6B7280", "#374151"]
      const customerSegments = (segmentsResult as any[]).map((row: any, index: number) => {
        const count = Number(row.count ?? 0)
        const share = totalConversions > 0 ? (count / totalConvForShare) * 100 : 0
        const prevCount = prevCounts.get(row.segment ?? "") ?? 0
        const trend = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0
        return {
          segment: row.segment ?? "Uncategorized",
          count,
          trend,
          color: grayscale[index] ?? "#9CA3AF",
          share,
        }
      })

      // ── E) Geography (top countries - TODAY) ────────────────────────────────
      const geoResult = await db
        .select({
          countryCode: clicks.geoCountry,
          clicks: sql<number>`count(DISTINCT ${clicks.id})`,
          conversions: sql<number>`count(DISTINCT ${conversions.id})`,
        })
        .from(clicks)
        .leftJoin(conversions, eq(clicks.id, conversions.clickId))
        .innerJoin(offers, and(eq(clicks.offerId, offers.id), eq(offers.status, "active")))
        .where(
          and(gte(clicks.createdAt, todayStart), lte(clicks.createdAt, todayEnd))
        )
        .groupBy(clicks.geoCountry)
        .orderBy(desc(sql`count(DISTINCT ${clicks.id})`))
        .limit(15)

      const geography = (geoResult as any[]).map((row: any) => ({
        countryCode: row.countryCode ?? "unknown",
        total: Number(row.clicks ?? 0),
        clicks: Number(row.clicks ?? 0),
        conversions: Number(row.conversions ?? 0),
        countryName: "",
        flag: "",
        lat: 0,
        lng: 0,
      }))

      // ── Trend percentages ───────────────────────────────────────────────────
      const prevConversionRate = prevClicks > 0 ? (prevConversions / prevClicks) * 100 : 0

      // ── F) Historical comparisons ──────────────────────────────────────────
      const msPerDay = 24 * 60 * 60 * 1000
      const nowTs = now.getTime()

      const getRevenueForPeriod = async (days: number) => {
        const from = new Date(nowTs - days * msPerDay)
        const to = now
        const prevFrom = new Date(from.getTime() - days * msPerDay)
        const prevTo = new Date(from.getTime() - 1)

        const [curr, prev] = await Promise.all([
          db
            .select({ total: sql<string>`coalesce(sum(${conversions.revenue}), 0)` })
            .from(conversions)
            .where(and(gte(conversions.createdAt, from), lte(conversions.createdAt, to))),
          db
            .select({ total: sql<string>`coalesce(sum(${conversions.revenue}), 0)` })
            .from(conversions)
            .where(and(gte(conversions.createdAt, prevFrom), lte(conversions.createdAt, prevTo))),
        ])

        const currTotal = Number(curr[0]?.total ?? 0)
        const prevTotal = Number(prev[0]?.total ?? 0)
        return prevTotal > 0 ? ((currTotal - prevTotal) / prevTotal) * 100 : 0
      }

      const [rev4w, rev13w, rev12m] = await Promise.all([
        getRevenueForPeriod(28),
        getRevenueForPeriod(91),
        getRevenueForPeriod(365),
      ])

      // ── G) Active Offers List (TODAY) ──────────────────────────────────────────
      const activeOffersList = await db
        .select({
          id: offers.id,
          name: offers.name,
          category: categories.name,
          status: offers.status,
          clicks: sql<number>`count(DISTINCT ${clicks.id})`,
          conversions: sql<number>`count(DISTINCT ${conversions.id})`,
          revenue: sql<string>`coalesce(sum(${conversions.revenue}), 0)`,
          lastConversion: sql<string>`max(${conversions.createdAt})`,
        })
        .from(offers)
        .innerJoin(
          clicks,
          and(eq(clicks.offerId, offers.id), gte(clicks.createdAt, todayStart), lte(clicks.createdAt, todayEnd))
        )
        .leftJoin(
          conversions,
          and(
            eq(conversions.clickId, clicks.id),
            gte(conversions.createdAt, todayStart),
            lte(conversions.createdAt, todayEnd)
          )
        )
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(eq(offers.status, "active"))
        .groupBy(offers.id, offers.name, categories.id, categories.name)
        .orderBy(desc(sql`count(DISTINCT ${clicks.id})`))
        .limit(5)

      const trends = {
        revenueChange: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        conversionsChange: prevConversions > 0 ? ((totalConversions - prevConversions) / prevConversions) * 100 : 0,
        activeOffersChange: prevActiveOffers > 0 ? ((activeOffers - prevActiveOffers) / prevActiveOffers) * 100 : 0,
        clicksChange: prevClicks > 0 ? ((totalClicks - prevClicks) / prevClicks) * 100 : 0,
        conversionRateChange:
          prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 : 0,
        revenueComparisons: {
          "4w": rev4w,
          "13w": rev13w,
          "12m": rev12m,
        },
      }

      // ── Response ─────────────────────────────────────────────────────────────
      return {
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalPayout,
            conversionRate,
            activeOffers,
            totalConversions,
            totalClicks,
            currency: "USD",
          },
          trends,
          revenueByPeriod,
          customerSegments,
          geography,
          activeOffersList: (activeOffersList as any[]).map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category ?? "Uncategorized",
            status: row.status,
            clicks: Number(row.clicks ?? 0),
            conversions: Number(row.conversions ?? 0),
            revenue: Number(row.revenue ?? 0),
            lastConversion: row.lastConversion,
          })),
        },
      }
    },
    { query: dashboardQuerySchema }
  )
