import { z } from "zod"
import {
  OFFER_AFFILIATE_STATUS,
  OFFER_STATUS_VALUES,
  OFFER_VISIBILITY_VALUES,
} from "../constants/status"

export const createLandingPageSchema = z.object({
  name: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  weight: z.coerce.number().int().min(1).default(1),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const createOfferSchema = z.object({
  name: z.string().min(1, "Offer name is required"),
  advertiserId: z.string().min(1, "Advertiser is required"),
  categoryId: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  privateNote: z.string().optional().nullable(),
  offerUrl: z.string().min(1, "Offer URL is required"),
  status: z.enum(OFFER_STATUS_VALUES).default("active").nonoptional(),
  visibility: z.enum(OFFER_VISIBILITY_VALUES).default("public").nonoptional(),

  // Revenue
  revenueType: z.string().default("CPA"),
  defaultRevenue: z.string().default("0"),
  currency: z.string().default("USD"),

  // Payout
  payoutType: z.string().default("CPA"),
  defaultPayout: z.string().default("0"),

  targetGeo: z.string().optional().nullable(),
  fallbackUrl: z.string().optional().nullable(),
  allowMultiConversion: z.boolean().default(false),

  postbackType: z.enum(["pixel", "postback"]).default("pixel").nonoptional(),
  whitelistPostbackReferralDomain: z.string().optional().nullable(),

  // Scheduling
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),

  landingPages: z
    .array(
      createLandingPageSchema.extend({
        id: z.string().optional(),
      })
    )
    .optional(),
})

export const updateOfferSchema = createOfferSchema.partial().omit({
  advertiserId: true,
})

export const updateLandingPageSchema = createLandingPageSchema.partial()

export const assignAffiliateSchema = z.object({
  affiliateId: z.string().min(1),
  status: z
    .enum(OFFER_AFFILIATE_STATUS)
    .default(OFFER_AFFILIATE_STATUS.APPROVED)
    .nonoptional(),
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
