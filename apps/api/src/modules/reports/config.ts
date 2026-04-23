import { z } from "zod"

const dateRange = {
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}

const paging = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
}

export const overviewQuerySchema = z.object({
  ...dateRange,
  offerId: z.string().optional(),
  affiliateId: z.string().optional(),
  advertiserId: z.string().optional(),
})

export const performanceQuerySchema = z.object({
  ...dateRange,
  offerId: z.string().optional(),
  affiliateId: z.string().optional(),
  advertiserId: z.string().optional(),
  groupBy: z.enum(["offer", "affiliate", "date"]).optional(),
  ...paging,
})

export const conversionLogQuerySchema = z.object({
  ...dateRange,
  offerId: z.string().optional(),
  affiliateId: z.string().optional(),
  ...paging,
})

export const dashboardQuerySchema = z.object({
  period: z.enum(["1w", "1m", "3m", "12m", "custom"]).default("1m"),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})
