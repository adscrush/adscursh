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
