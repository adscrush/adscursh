import { z } from "zod"

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  advertiserId: z.string().optional(),
})

export const trackingUrlQuerySchema = z.object({
  trackingDomain: z.string().optional(),
  affiliateId: z.string(),
  landingPageId: z.string().optional(),
})
