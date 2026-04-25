import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsIsoDate,
} from "nuqs/server"

export const performanceSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(100),
  offerId: parseAsString,
  advertiserId: parseAsString,
  affiliateId: parseAsString,
  dateFrom: parseAsIsoDate,
  dateTo: parseAsIsoDate,
  managerId: parseAsString,
  event: parseAsString,
  currency: parseAsString,
  timezone: parseAsString.withDefault("GMT+5:30"),
  subOffer: parseAsString,
  logType: parseAsString.withDefault("all"),
  hour: parseAsString,
  status: parseAsString,
  groupBy: parseAsString.withDefault("detailed"),
  sort: parseAsString, // e.g. "clicks.desc"
  q: parseAsString, // search query
}

export const searchParamsCache = createSearchParamsCache(performanceSearchParams)
export type PerformanceSearchParams = typeof performanceSearchParams
