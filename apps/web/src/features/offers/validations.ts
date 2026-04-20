import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  advertiserId: parseAsString.withDefault(""),
})

export type GetOffersSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
