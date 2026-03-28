import { z } from "zod"

export const createOfferSchema = z.object({
  name: z.string().min(1),
  advertiserId: z.string().min(1),
  description: z.string().optional(),
  offerUrl: z.string().url(),
  previewUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "paused", "expired"]).default("active"),
  payoutType: z.enum(["CPA", "CPC", "CPL", "CPS"]).default("CPA"),
  defaultPayout: z.string().default("0"),
  defaultRevenue: z.string().default("0"),
  currency: z.string().default("USD"),
  targetGeo: z.string().optional(),
  fallbackUrl: z.string().url().optional().or(z.literal("")),
  allowMultiConversion: z.boolean().default(false),
})

export const updateOfferSchema = createOfferSchema.partial().omit({
  advertiserId: true,
})

export const createLandingPageSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  weight: z.number().int().min(1).default(1),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const updateLandingPageSchema = createLandingPageSchema.partial()

export const assignAffiliateSchema = z.object({
  affiliateId: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  customPayout: z.string().optional(),
  customRevenue: z.string().optional(),
})

export const updateOfferAffiliateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  customPayout: z.string().optional(),
  customRevenue: z.string().optional(),
})

export const bulkOfferAffiliateSchema = z.object({
  affiliateIds: z.array(z.string().min(1)),
  status: z.enum(["approved", "rejected"]),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>
export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>
export type AssignAffiliateInput = z.infer<typeof assignAffiliateSchema>
