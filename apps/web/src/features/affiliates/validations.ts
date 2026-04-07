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

const statusValues = ["active", "inactive", "pending"] as string[]

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value)
  ).withDefault("commandFilters"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: getSortingStateParser<Record<string, unknown>>().withDefault([
    { id: "createdAt", desc: true },
  ] as any),
  name: parseAsString.withDefault(""),
  status: parseAsArrayOf(
    parseAsStringEnum(statusValues as ["active", "inactive", "pending"])
  ).withDefault([]),
  createdAt: parseAsArrayOf(parseAsString).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetAffiliatesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
