export const ENTITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS]

export const OFFER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PAUSED: "paused",
  EXPIRED: "expired",
} as const

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS]

export const OFFER_AFFILIATE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export type OfferAffiliateStatus =
  (typeof OFFER_AFFILIATE_STATUS)[keyof typeof OFFER_AFFILIATE_STATUS]

export const PAYOUT_TYPE = {
  CPA: "CPA",
  CPC: "CPC",
  CPL: "CPL",
  CPS: "CPS",
} as const

export type PayoutType = (typeof PAYOUT_TYPE)[keyof typeof PAYOUT_TYPE]

export const CONVERSION_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
  HOLD: "hold",
} as const

export type ConversionStatus =
  (typeof CONVERSION_STATUS)[keyof typeof CONVERSION_STATUS]

export const ADVERTISER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const

export type AdvertiserStatus =
  (typeof ADVERTISER_STATUS)[keyof typeof ADVERTISER_STATUS]
