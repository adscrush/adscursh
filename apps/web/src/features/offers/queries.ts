import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import {
  assignAffiliateSchema,
  createOfferSchema,
  updateOfferAffiliateSchema,
} from "@adscrush/shared/validators/offer.schema"
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
export type OfferDetail = NonNullable<
  Treaty.Data<ReturnType<typeof api.offers>["get"]>["data"]
>
export type Category = Treaty.Data<typeof api.categories.get>["data"][number]
export type OfferAffiliate = Treaty.Data<
  typeof api.affiliates.get
>["data"][number]

/* ── Query Keys ────────────────────────────────────────────────────── */

export const offerKeys = {
  all: ["offers"] as const,
  lists: () => [...offerKeys.all, "list"] as const,
  list: (params: GetOffersSchema) =>
    [...offerKeys.lists(), { params }] as const,
  detail: (id: string) => [...offerKeys.all, "detail", id] as const,
  affiliates: (id: string) => [...offerKeys.detail(id), "affiliates"] as const,
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
          createdAt: params.createdAt,
          status: params.status,
          advertiserId: params.advertiserId,
        },
      })
      if (error) throw new Error(parseApiError(error))
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function getOfferQueryOptions(id: string) {
  return queryOptions({
    queryKey: offerKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.offers({ id }).get()
      if (error) throw new Error(parseApiError(error))
      return data
    },
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

export function useOffer(id: string) {
  return useQuery(getOfferQueryOptions(id))
}

export function useOfferAffiliates(id: string) {
  return useQuery({
    queryKey: offerKeys.affiliates(id),
    queryFn: async () => {
      const { data, error } = await api.offers({ id }).affiliates.get()
      if (error) throw new Error(parseApiError(error))
      return data
    },
  })
}

export function useAssignOfferAffiliate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: z.infer<typeof assignAffiliateSchema>
    }) => {
      const response = await api.offers({ id }).affiliates.post(data)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: offerKeys.affiliates(variables.id),
      })
    },
  })
}

export function useUpdateOfferAffiliate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      offerId,
      oaId,
      data,
    }: {
      offerId: string
      oaId: string
      data: z.infer<typeof updateOfferAffiliateSchema>
    }) => {
      const response = await api
        .offers({ id: offerId })
        .affiliates({ oaId })
        .post(data)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: offerKeys.affiliates(variables.offerId),
      })
    },
  })
}

export function useCategories(params: any = {}) {
  return useQuery(getCategoriesQueryOptions(params))
}

export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: z.infer<typeof createOfferSchema>) => {
      const response = await api.offers.post(data)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
    },
  })
}

export function useUpdateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<z.infer<typeof createOfferSchema>>
    }) => {
      const response = await api.offers({ id }).post(data)
      if (response.error) throw new Error(parseApiError(response.error))
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
      queryClient.invalidateQueries({
        queryKey: offerKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.categories({ id }).delete.post()
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
