import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import { queryOptions, useQuery } from "@tanstack/react-query"
import type { DashboardResponse, DashboardPeriod } from "./types"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  detail: () => [...dashboardKeys.all, "detail"] as const,
  analytics: (params: { period: DashboardPeriod; dateFrom?: string; dateTo?: string }) =>
    [...dashboardKeys.detail(), { params }] as const,
}

export function getDashboardAnalyticsQueryOptions(params: {
  period: DashboardPeriod
  dateFrom?: string
  dateTo?: string
}) {
  return queryOptions({
    queryKey: dashboardKeys.analytics(params),
    queryFn: async () => {
      const { data, error } = await api.reports.dashboard.get({
        query: params as any,
      })
      console.log(JSON.stringify(data), "data")
      console.log(JSON.stringify(error), "error")
      if (error) throw new Error(parseApiError(error))
      if (!data) throw new Error("No data received")
      return data.data as DashboardResponse
    },
  })
}

export function useDashboardAnalytics(params: { period: DashboardPeriod; dateFrom?: string; dateTo?: string }) {
  return useQuery(getDashboardAnalyticsQueryOptions(params))
}
