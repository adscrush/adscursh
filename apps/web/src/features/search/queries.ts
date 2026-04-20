import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import { useQuery } from "@tanstack/react-query"

export const searchKeys = {
  all: ["search"] as const,
  employees: (q: string) => [...searchKeys.all, "employees", q] as const,
  affiliates: (q: string) => [...searchKeys.all, "affiliates", q] as const,
  advertisers: (q: string) => [...searchKeys.all, "advertisers", q] as const,
}

export function useEmployeeSearch(q: string) {
  return useQuery({
    queryKey: searchKeys.employees(q),
    queryFn: async () => {
      const { data, error } = await api.employees.search.get({
        query: { q },
      })

      if (error) throw new Error(parseApiError(error))
      if (!data?.success) throw new Error("Failed to search employees")

      return data.data
    },
    enabled: q.length >= 0,
  })
}

export function useAffiliateSearch(q: string) {
  return useQuery({
    queryKey: searchKeys.affiliates(q),
    queryFn: async () => {
      const { data, error } = await api.affiliates.search.get({
        query: { q },
      })

      if (error) throw new Error(parseApiError(error))
      if (!data?.success) throw new Error("Failed to search affiliates")

      return data.data
    },
    enabled: q.length >= 0,
  })
}

export function useAdvertiserSearch(q: string) {
  return useQuery({
    queryKey: searchKeys.advertisers(q),
    queryFn: async () => {
      const { data, error } = await api.advertisers.search.get({
        query: { q },
      })

      if (error) throw new Error(parseApiError(error))
      if (!data?.success) throw new Error("Failed to search advertisers")

      return data.data
    },
    enabled: q.length >= 0,
  })
}
