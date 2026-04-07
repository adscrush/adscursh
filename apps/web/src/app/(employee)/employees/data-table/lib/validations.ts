import { getFiltersStateParser, getSortingStateParser } from "@/components/data-table/lib/parsers"
import { flagConfig } from "@/config/flag"
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server"

const statusValues = ["active", "inactive", "suspended"] as string[]

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value)
  ).withDefault("commandFilters"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: getSortingStateParser().withDefault([{ id: "createdAt", desc: true }]),
  name: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  status: parseAsArrayOf(parseAsStringEnum(statusValues as ["active", "inactive", "suspended"])).withDefault([]),
  createdAt: parseAsArrayOf(parseAsString).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetEmployeesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
