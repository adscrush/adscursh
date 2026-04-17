export function createEnum<const T extends Record<string, string>>(obj: T): T {
  return obj
}
export const getEnumValues = <const T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [T[keyof T], ...T[keyof T][]]

/* ---------------------------------- */
/* ENTITY STATUS */
/* ---------------------------------- */

export const ENTITY_STATUS = createEnum({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
})

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS]

export const ENTITY_STATUS_VALUES = getEnumValues(ENTITY_STATUS)

/* ---------------------------------- */
/* OFFER STATUS */
/* ---------------------------------- */

export const OFFER_STATUS = createEnum({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PAUSED: "paused",
  EXPIRED: "expired",
})

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS]

export const OFFER_STATUS_VALUES = getEnumValues(OFFER_STATUS)

/* ---------------------------------- */
/* OFFER AFFILIATE STATUS */
/* ---------------------------------- */

export const OFFER_AFFILIATE_STATUS = createEnum({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
})

export type OfferAffiliateStatus =
  (typeof OFFER_AFFILIATE_STATUS)[keyof typeof OFFER_AFFILIATE_STATUS]

export const OFFER_AFFILIATE_STATUS_VALUES = getEnumValues(
  OFFER_AFFILIATE_STATUS
)

/* ---------------------------------- */
/* PAYOUT TYPE */
/* ---------------------------------- */

export const PAYOUT_TYPE = createEnum({
  CPA: "CPA",
  CPC: "CPC",
  CPL: "CPL",
  CPS: "CPS",
})

export type PayoutType = (typeof PAYOUT_TYPE)[keyof typeof PAYOUT_TYPE]

export const PAYOUT_TYPE_VALUES = getEnumValues(PAYOUT_TYPE)

/* ---------------------------------- */
/* CONVERSION STATUS */
/* ---------------------------------- */

export const CONVERSION_STATUS = createEnum({
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
  HOLD: "hold",
})

export type ConversionStatus =
  (typeof CONVERSION_STATUS)[keyof typeof CONVERSION_STATUS]

export const CONVERSION_STATUS_VALUES = getEnumValues(CONVERSION_STATUS)

/* ---------------------------------- */
/* SHARED BASE STATUS */
/* ---------------------------------- */

export const BASE_ACTIVE_STATUS = createEnum({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
})

/* ---------------------------------- */
/* ADVERTISER STATUS */
/* ---------------------------------- */

export const ADVERTISER_STATUS = BASE_ACTIVE_STATUS

export type AdvertiserStatus =
  (typeof ADVERTISER_STATUS)[keyof typeof ADVERTISER_STATUS]

export const ADVERTISER_STATUS_VALUES = getEnumValues(ADVERTISER_STATUS)

/* ---------------------------------- */
/* AFFILIATE STATUS */
/* ---------------------------------- */

export const AFFILIATE_STATUS = BASE_ACTIVE_STATUS

export type AffiliateStatus =
  (typeof AFFILIATE_STATUS)[keyof typeof AFFILIATE_STATUS]

export const AFFILIATE_STATUS_VALUES = getEnumValues(AFFILIATE_STATUS)

/* ---------------------------------- */
/* EMPLOYEE STATUS */
/* ---------------------------------- */

export const EMPLOYEE_STATUS = createEnum({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
})

export const EMPLOYEE_STATUS_VALUES = getEnumValues(EMPLOYEE_STATUS)
export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]
