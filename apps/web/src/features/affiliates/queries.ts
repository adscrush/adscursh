import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { createAffiliateSchema } from "@adscrush/shared/validators/affiliate.validator"
import type { z } from "zod"

/* ── Types ────────────────────────────────────────────────────────── */

export interface Affiliate {
  id: string
  name: string
  companyName: string | null
  email: string
  accountManagerId: string | null
  accountManager?: { id: string; name: string }
  status: "active" | "inactive" | "pending"
  createdAt: Date
}

/* ── Query Keys ────────────────────────────────────────────────────── */

export const affiliateKeys = {
  all: ["affiliates"] as const,
  lists: () => [...affiliateKeys.all, "list"] as const,
  list: (filters: {
    page: number
    perPage: number
    search?: string
    status?: string
    accountManagerId?: string
  }) => [...affiliateKeys.lists(), { filters }] as const,
  statusCounts: () => [...affiliateKeys.all, "status-counts"] as const,
  employeeList: () => [...affiliateKeys.all, "employees"] as const,
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function parseApiError(errorPayload: unknown): string {
  if (!errorPayload) return "An unexpected error occurred"

  // If we passed Eden's error object directly containing `.value`
  const obj = errorPayload as Record<string, unknown>
  const data = (obj.status && obj.value ? obj.value : obj) as Record<
    string,
    unknown
  >

  if (typeof data === "string") return data

  if (data.error) {
    return String(data.error)
  }

  if (data.message) return String(data.message)

  return "An unexpected error occurred"
}

/* ── Query Options Factories ──────────────────────────────────────── */

export function getAffiliatesQueryOptions(params: {
  page: number
  perPage: number
  search?: string
  status?: "active" | "inactive" | "pending"
  accountManagerId?: string
}) {
  return queryOptions({
    queryKey: affiliateKeys.list({
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      accountManagerId: params.accountManagerId,
    }),
    queryFn: async () => {
      const { data, error } = await api.affiliates.get({
        query: {
          page: params.page,
          limit: params.perPage,
          ...(params.search ? { search: params.search } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.accountManagerId
            ? { accountManagerId: params.accountManagerId }
            : {}),
        },
      })

      if (error) {
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Invalid response")
      }

      return { data: data.data, pageCount: data.meta.totalPages, meta: data.meta }
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

export function useAffiliates(params: {
  page: number
  perPage: number
  search?: string
  status?: "active" | "inactive" | "pending"
  accountManagerId?: string
}) {
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
        .delete()
        
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
        .put(payload)
        
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
