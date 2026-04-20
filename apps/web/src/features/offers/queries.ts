import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import { createOfferSchema } from "@adscrush/shared/validators/offer.validator"
import { Treaty } from "@elysiajs/eden"
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { z } from "zod"
import { GetOffersSchema } from "./validations"

/* ── Types ─────────────────────────────────────────────────────────── */
export type Offer = Treaty.Data<typeof api.offers.get>["data"][number]
export type Category = Treaty.Data<typeof api.categories.get>["data"][number]

/* ── Query Keys ────────────────────────────────────────────────────── */

export const offerKeys = {
  all: ["offers"] as const,
  lists: () => [...offerKeys.all, "list"] as const,
  list: (params: GetOffersSchema) => [...offerKeys.lists(), { params }] as const,
  detail: (id: string) => [...offerKeys.all, "detail", id] as const,
}

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
}

/* ── Query Options ─────────────────────────────────────────────────── */

export function getOffersQueryOptions(params: GetOffersSchema) {
  return queryOptions({
    queryKey: offerKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.offers.get({
        query: {
          filterFlag: params.filterFlag,
          search: params.search ?? "",
          page: params.page,
          perPage: params.perPage,
          sort: JSON.stringify(
            params.sort
          ) as unknown as GetOffersSchema["sort"],
          filters: JSON.stringify(
            params.filters
          ) as unknown as GetOffersSchema["filters"],
          joinOperator: params.joinOperator,
          createdAt: params.createdAt as any,
          status: params.status as any,
          advertiserId: params.advertiserId,
        },
      })
      if (error) throw new Error(parseApiError(error))
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function getCategoriesQueryOptions(params: any = {}) {
  return queryOptions({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await api.categories.get({ query: params })
      if (error) throw new Error(parseApiError(error))
      return data
    },
  })
}

/* ── Hooks ─────────────────────────────────────────────────────────── */

export function useOffers(params: GetOffersSchema) {
  return useQuery(getOffersQueryOptions(params))
}

export function useCategories(params: any = {}) {
  return useQuery(getCategoriesQueryOptions(params))
}

export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: z.infer<typeof createOfferSchema>) => {
      const response = await api.offers.post(data as any)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.categories[id].delete.post()
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.categories.post(data)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
