import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import { createAdvertiserSchema } from "@adscrush/shared/validators/advertiser.schema"
import { Treaty } from "@elysiajs/eden"
import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { z } from "zod"
import { GetAdvertisersSchema } from "./validations"

/* ── Types ─────────────────────────────────────────────────────────── */
export type Advertiser = Treaty.Data<typeof api.advertisers.get>["data"][number]

/* ── Query Keys ────────────────────────────────────────────────────── */

export const advertiserKeys = {
  all: ["advertisers"] as const,
  lists: () => [...advertiserKeys.all, "list"] as const,
  list: (params: Omit<GetAdvertisersSchema, "filterFlag"> & { filterFlag?: string }) =>
    [...advertiserKeys.lists(), { params }] as const,
  statusCounts: () => [...advertiserKeys.all, "status-counts"] as const,
  employeeList: () => [...advertiserKeys.all, "employees"] as const,
}

/* ── Query Options Factories (usable in ensureQueryData + useQuery) ── */

export function getAdvertisersQueryOptions(params: GetAdvertisersSchema) {
  return queryOptions({
    queryKey: advertiserKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.advertisers.get({
        query: {
          filterFlag: params.filterFlag,
          name: params.name ?? "",
          page: params.page,
          perPage: params.perPage,
          sort: JSON.stringify(params.sort) as unknown as GetAdvertisersSchema["sort"],
          filters: JSON.stringify(params.filters) as unknown as GetAdvertisersSchema["filters"],
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
export function getAdvertiserStatusCountsOptions() {
  return queryOptions({
    queryKey: advertiserKeys.statusCounts(),
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

export function useAdvertisers(params: GetAdvertisersSchema) {
  return useQuery(getAdvertisersQueryOptions(params))
}

export function useDeleteAdvertiser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.advertisers({ id }).delete.post({})
      if (!response?.data?.success) {
        throw new Error("Failed to delete advertiser")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advertiserKeys.all })
    },
  })
}

export function useCreateAdvertiser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: z.infer<typeof createAdvertiserSchema>) => {
      const response = await api.advertisers.post(data)
      if (!response.data?.success) {
        throw new Error((response.data as any).error || "Failed to create advertiser")
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advertiserKeys.all })
    },
  })
}

export function useUpdateAdvertiser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<z.infer<typeof createAdvertiserSchema>>) => {
      const response = await api.advertisers({ id }).post(payload)
      if (!response?.data?.success) {
        throw new Error((response.data as any).error || "Failed to update advertiser")
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advertiserKeys.all })
    },
  })
}
