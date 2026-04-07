import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { createAdvertiserSchema } from "@adscrush/shared/validators/advertiser.schema"
import type { z } from "zod"

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Advertiser {
  id: string
  name: string
  companyName: string | null
  email: string
  website: string | null
  country: string | null
  accountManagerId: string | null
  accountManager?: { id: string; name: string }
  status: "active" | "inactive" | "pending"
  createdAt: Date
}

/* ── Query Keys ────────────────────────────────────────────────────── */

export const advertiserKeys = {
  all: ["advertisers"] as const,
  lists: () => [...advertiserKeys.all, "list"] as const,
  list: (filters: {
    page: number
    perPage: number
    search?: string
    status?: string
    accountManagerId?: string
  }) => [...advertiserKeys.lists(), { filters }] as const,
  statusCounts: () => [...advertiserKeys.all, "status-counts"] as const,
  employeeList: () => [...advertiserKeys.all, "employees"] as const,
}

/* ── Query Options Factories (usable in ensureQueryData + useQuery) ── */

export function getAdvertisersQueryOptions(params: {
  page: number
  perPage: number
  search?: string
  status?: string
  accountManagerId?: string
}) {
  return queryOptions({
    queryKey: advertiserKeys.list({
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      accountManagerId: params.accountManagerId,
    }),
    queryFn: async () => {
      const response = await api.advertisers.get({
        query: {
          page: params.page,
          limit: params.perPage,
          ...(params.search ? { search: params.search } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.accountManagerId
            ? { accountManagerId: params.accountManagerId }
            : {}),
        },
        throwHttpError: true as any,
      })

      const responseData = response.data
      if (!responseData || !responseData.success) {
        throw new Error("Failed to fetch advertisers")
      }

      const data = responseData.data as Advertiser[]
      const meta = responseData.meta as {
        page: number
        limit: number
        total: number
        totalPages: number
      }

      return { data, pageCount: meta.totalPages, meta }
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

export function useAdvertisers(params: {
  page: number
  perPage: number
  search?: string
  status?: string
  accountManagerId?: string
}) {
  return useQuery(getAdvertisersQueryOptions(params))
}

export function useDeleteAdvertiser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await (api.advertisers as any)(id).delete()
      if (!response?.data?.success) {
        throw new Error(response?.data?.error || "Failed to delete advertiser")
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
      const response = await api.advertisers.post(data as never)
      if (!response.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to create advertiser"
        )
      }
      return response.data.data as Advertiser
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advertiserKeys.all })
    },
  })
}

export function useUpdateAdvertiser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<z.infer<typeof createAdvertiserSchema>>) => {
      const response = await (api.advertisers as any)(id).put(payload)
      if (!response?.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to update advertiser"
        )
      }
      return response.data.data as Advertiser
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advertiserKeys.all })
    },
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: advertiserKeys.employeeList(),
    queryFn: async () => {
      const response = await api.employees.get({ query: { limit: 100 } })
      if (!response.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to fetch employees"
        )
      }
      return response.data.data as {
        id: string
        name: string
        image: string | null
      }[]
    },
    staleTime: 5 * 60 * 1000,
  })
}
