import Elysia from "elysia"
import { requireAuth } from "../../middleware/auth.middleware"
import { db } from "../../lib/db"
import {
  getOverview,
  getPerformanceReport,
  getConversionLog,
} from "./reports.service"

export const reportRoutes = new Elysia({ prefix: "/api/reports" })
  .use(requireAuth)
  .get("/overview", async ({ query }) => {
    const data = await getOverview(db, {
      dateFrom: query.dateFrom as string | undefined,
      dateTo: query.dateTo as string | undefined,
      offerId: query.offerId as string | undefined,
      affiliateId: query.affiliateId as string | undefined,
      advertiserId: query.advertiserId as string | undefined,
    })
    return { success: true, data }
  })
  .get("/performance", async ({ query }) => {
    const result = await getPerformanceReport(db, {
      dateFrom: query.dateFrom as string | undefined,
      dateTo: query.dateTo as string | undefined,
      offerId: query.offerId as string | undefined,
      affiliateId: query.affiliateId as string | undefined,
      groupBy: (query.groupBy as "offer" | "affiliate" | "date") ?? "offer",
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    })
    return { success: true, ...result }
  })
  .get("/conversions", async ({ query }) => {
    const result = await getConversionLog(db, {
      dateFrom: query.dateFrom as string | undefined,
      dateTo: query.dateTo as string | undefined,
      offerId: query.offerId as string | undefined,
      affiliateId: query.affiliateId as string | undefined,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    })
    return { success: true, ...result }
  })
