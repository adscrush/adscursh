import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/parsers"
import { flagConfig } from "@/config/flag"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { OFFER_STATUS_VALUES } from "@adscrush/shared/constants/status"
import { type Offer } from "./queries"

export type OfferListSortableColumns = Omit<
  Offer,
  "advertiser" | "category"
> & {
  advertiser: string
  category: string
  payout: string
  revenue: string
}

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value)
  ).withDefault("commandFilters"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),

  sort: getSortingStateParser<OfferListSortableColumns>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  status: parseAsArrayOf(parseAsStringEnum(OFFER_STATUS_VALUES)).withDefault(
    []
  ),

  createdAt: parseAsArrayOf(parseAsInteger).withDefault([]),
  advertiserId: parseAsString.withDefault(""),

  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetOffersSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
