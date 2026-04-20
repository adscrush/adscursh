import { Offer } from "@adscrush/db/schema"
import { OFFER_STATUS_VALUES } from "@adscrush/shared/constants/status"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/query-parser"
import { z } from "zod"

export type OfferListSortableExtraColumns = {
  advertiser: string
  category: string
  payout: string
  revenue: string
}
export const listQuerySchema = z.object({
  filterFlag: z
    .enum(["advancedFilters", "commandFilters"])
    .default("commandFilters"),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(200).default(20),

  sort: getSortingStateParser<Offer & OfferListSortableExtraColumns>().default([
    { id: "createdAt", desc: true },
  ]),
  filters: getFiltersStateParser().default([]),

  search: z.string().default(""),
  status: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.length > 0) return val.split(",")
      if (typeof val === "string" && val.length === 0) return []
      return val
    },
    z.array(z.enum(OFFER_STATUS_VALUES)).default([])
  ),
  advertiserId: z.string().optional(),

  createdAt: z.preprocess((val) => {
    if (typeof val === "string" && val.length > 0)
      return val.split(",").map(Number)
    if (typeof val === "string" && val.length === 0) return []
    return val
  }, z.array(z.coerce.number().int().positive()).default([])),
  joinOperator: z.enum(["and", "or"]).default("and"),
})

export const trackingUrlQuerySchema = z.object({
  trackingDomain: z.string().optional(),
  affiliateId: z.string(),
  landingPageId: z.string().optional(),
})
