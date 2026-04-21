/**
 * Standard Tracking Tokens
 * These are the query parameters usually sent in the tracking URL
 */
export const STANDARD_TRACKING_TOKENS = [
  { label: "aff_click_id", placeholder: "{replace_it}" },
  { label: "sub_aff_id", placeholder: "{replace_it}" },
  { label: "aff_sub1", placeholder: "{replace_it}" },
  { label: "aff_sub2", placeholder: "{replace_it}" },
  { label: "aff_sub3", placeholder: "{replace_it}" },
  { label: "aff_sub4", placeholder: "{replace_it}" },
  { label: "aff_sub5", placeholder: "{replace_it}" },
  { label: "aff_sub6", placeholder: "{replace_it}" },
  { label: "aff_sub7", placeholder: "{replace_it}" },
  { label: "aff_sub8", placeholder: "{replace_it}" },
  { label: "aff_sub9", placeholder: "{replace_it}" },
  { label: "aff_sub10", placeholder: "{replace_it}" },
  { label: "source", placeholder: "{replace_it}" },
] as const

/**
 * Additional Macros
 * These are system-wide placeholders that are replaced during redirect flow
 */
export const ADDITIONAL_MACROS = [
  { label: "{click_id}", placeholder: "System Click ID (UUID)" },
  { label: "{tid}", placeholder: "Transaction ID alias for Click ID" },
  { label: "{offer_id}", placeholder: "Offer ID" },
  { label: "{affiliate_id}", placeholder: "Affiliate ID" },
  { label: "{payout}", placeholder: "Payout Amount" },
  { label: "{revenue}", placeholder: "Revenue Amount" },
  { label: "{currency}", placeholder: "Currency" },
  { label: "{event}", placeholder: "Goal Event Name" },
] as const

/**
 * URL Tokens
 * Consolidates tokens available for insertion into URL fields (Offer URL, Landing Page URL)
 */
export const URL_TOKENS = [
  { label: "Transaction ID", value: "{tid}" },
  { label: "Click ID", value: "{clickid}" },
  { label: "Affiliate ID", value: "{aff_id}" },
  { label: "Sub 1", value: "{sub1}" },
  { label: "Sub 2", value: "{sub2}" },
  { label: "Sub 3", value: "{sub3}" },
  { label: "Source", value: "{source}" },
  { label: "Campaign", value: "{campaign}" },
] as const
