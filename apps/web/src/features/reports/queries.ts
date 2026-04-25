import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import { queryOptions, useQuery } from "@tanstack/react-query"
import type { DetailedPerformanceResponse, ReportOverviewResponse, MTDStatsResponse } from "./types"

export const reportQueries = {
  all: ["reports"] as const,
  performance: () => [...reportQueries.all, "performance"] as const,
  detailed: (params: any) => [...reportQueries.performance(), "detailed", params] as const,
  overview: (params: any) => [...reportQueries.all, "overview", params] as const,
  mtd: (params: any) => [...reportQueries.all, "mtd", params] as const,
}

export const mtdStatsQueryOptions = (params: {
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
}) => {
  return queryOptions({
    queryKey: reportQueries.mtd(params),
    queryFn: async () => {
      const { data, error } = await api.reports.stats.mtd.get({
        query: {
          offerId: params.offerId ?? undefined,
          affiliateId: params.affiliateId ?? undefined,
          advertiserId: params.advertiserId ?? undefined,
        },
      })
      if (error) throw new Error(parseApiError(error))
      return data as MTDStatsResponse
    },
  })
}

export function useMTDStats(params: {
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
}) {
  return useQuery(mtdStatsQueryOptions(params))
}

export const detailedPerformanceQueryOptions = (params: {
  dateFrom?: string | null
  dateTo?: string | null
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
  status?: string | null
  page?: number
  limit?: number
  groupBy?: "offer" | "affiliate" | "landing_page" | "detailed" | "daily" | "date"
}) => {
  return queryOptions({
    queryKey: reportQueries.detailed(params),
    queryFn: async () => {
      const { data, error } = await api.reports.performance.get({
        query: {
          dateFrom: params.dateFrom ?? undefined,
          dateTo: params.dateTo ?? undefined,
          offerId: params.offerId ?? undefined,
          affiliateId: params.affiliateId ?? undefined,
          advertiserId: params.advertiserId ?? undefined,
          status: params.status ?? undefined,
          page: params.page,
          limit: params.limit,
          groupBy: params.groupBy ?? "detailed",
        },
      })
      if (error) throw new Error(parseApiError(error))
      return data as DetailedPerformanceResponse
    },
  })
}

export function useDetailedPerformance(params: {
  dateFrom?: string | null
  dateTo?: string | null
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
  status?: string | null
  page?: number
  limit?: number
  groupBy?: "offer" | "affiliate" | "landing_page" | "detailed" | "daily" | "date"
}) {
  return useQuery(detailedPerformanceQueryOptions(params))
}

export const reportOverviewQueryOptions = (params: {
  dateFrom?: string | null
  dateTo?: string | null
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
}) => {
  return queryOptions({
    queryKey: reportQueries.overview(params),
    queryFn: async () => {
      const { data, error } = await api.reports.overview.get({
        query: {
          dateFrom: params.dateFrom ?? undefined,
          dateTo: params.dateTo ?? undefined,
          offerId: params.offerId ?? undefined,
          affiliateId: params.affiliateId ?? undefined,
          advertiserId: params.advertiserId ?? undefined,
        },
      })
      if (error) throw new Error(parseApiError(error))
      return data as ReportOverviewResponse
    },
  })
}

export function useReportOverview(params: {
  dateFrom?: string | null
  dateTo?: string | null
  offerId?: string | null
  affiliateId?: string | null
  advertiserId?: string | null
}) {
  return useQuery(reportOverviewQueryOptions(params))
}
