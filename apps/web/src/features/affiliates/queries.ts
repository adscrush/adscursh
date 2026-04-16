import { api } from "@/lib/api"
import { createAffiliateSchema } from "@adscrush/shared/validators/affiliate.validator"
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { z } from "zod"

import type { GetAffiliatesSchema } from "./validations"
import { Treaty } from "@elysiajs/eden"
import { parseApiError } from "@/lib/error"

/* ── Types ────────────────────────────────────────────────────────── */
export type Affiliate = Treaty.Data<typeof api.affiliates.get>["data"][number]
/* ── Query Keys ────────────────────────────────────────────────────── */

export const affiliateKeys = {
  all: ["affiliates"] as const,
  lists: () => [...affiliateKeys.all, "list"] as const,
  list: (
    params: Omit<GetAffiliatesSchema, "filterFlag"> & { filterFlag?: string }
  ) => [...affiliateKeys.lists(), { params }] as const,
  statusCounts: () => [...affiliateKeys.all, "status-counts"] as const,
  employeeList: () => [...affiliateKeys.all, "employees"] as const,
}

/* ── Query Options Factories ──────────────────────────────────────── */

export function getAffiliatesQueryOptions(params: GetAffiliatesSchema) {
  return queryOptions({
    queryKey: affiliateKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.affiliates.get({
        query: {
          filterFlag: params.filterFlag,
          name: params.name ?? "",
          page: params.page,
          perPage: params.perPage,
          sort: JSON.stringify(
            params.sort
          ) as unknown as GetAffiliatesSchema["sort"],
          filters: JSON.stringify(
            params.filters
          ) as unknown as GetAffiliatesSchema["filters"],
          joinOperator: params.joinOperator,
          createdAt: params.createdAt,
          status: params.status,
        },
      })

      if (error) {
        console.log(JSON.stringify(error))
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Invalid response")
      }

      return {
        data: data.data,
        pageCount: data.meta.totalPages,
        meta: data.meta,
      }
    },
    placeholderData: keepPreviousData,
  })
}

export function getAffiliateStatusCountsOptions() {
  return queryOptions({
    queryKey: affiliateKeys.statusCounts(),
    queryFn: async () => {
      return { active: 0, inactive: 0, pending: 0 } as {
        active: number
        inactive: number
        pending: number
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/* ── Hooks ─────────────────────────────────────────────────────────── */

export function useAffiliates(params: GetAffiliatesSchema) {
  return useQuery(getAffiliatesQueryOptions(params))
}

export function useDeleteAffiliate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api
        .affiliates({
          id,
        })
        .post({})

      if (error) {
        throw new Error(parseApiError(error))
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all })
    },
  })
}

export function useCreateAffiliate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: z.infer<typeof createAffiliateSchema>) => {
      const { data: resData, error } = await api.affiliates.post(data)

      if (error) {
        console.log(error)
        throw new Error(parseApiError(error))
      }

      if (!resData || !resData.success) {
        throw new Error("Failed to create affiliate")
      }

      return resData.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all })
    },
  })
}

export function useUpdateAffiliate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<z.infer<typeof createAffiliateSchema>>) => {
      const { data, error } = await api
        .affiliates({
          id,
        })
        .post(payload)

      if (error) {
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Failed to update affiliate")
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all })
    },
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: affiliateKeys.employeeList(),
    queryFn: async () => {
      const { data, error } = await api.employees.get({ query: { limit: 100 } })

      if (error) {
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Failed to fetch employees")
      }

      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
