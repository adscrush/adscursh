"use client"

import { useDetailedPerformance } from "../queries"
import { detailedReportsColumns } from "./detailed-reports-columns"
import { DataTable } from "@/components/data-table/data-table"
import { formatCurrency, formatCompactNumber } from "@/features/dashboard/utils"
import { useMemo } from "react"
import { Download, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@adscrush/ui/components/button"
import { useQueryStates } from "nuqs"
import { performanceSearchParams } from "../validations"
import { useDataTable } from "@/hooks/use-data-table"
import type { DetailedPerformanceItem } from "../types"

export function DetailedReportsTable() {
  const [filters] = useQueryStates(performanceSearchParams, {
    shallow: false,
  })

  const { data, isLoading, refetch, isFetching } = useDetailedPerformance({
    ...filters,
    groupBy: filters.groupBy as any,
    dateFrom: filters.dateFrom?.toISOString() || null,
    dateTo: filters.dateTo?.toISOString() || null,
  })

  const tableData = useMemo(() => data?.data ?? [], [data])

  const { table } = useDataTable<DetailedPerformanceItem>({
    data: tableData,
    columns: detailedReportsColumns,
    pageCount: 1, // Snapshot report, manually handled by data fetch
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    initialState: {
      columnVisibility: {},
    },
  })

  const totals = useMemo(() => {
    return tableData.reduce(
      (acc, item) => ({
        clicks: acc.clicks + Number(item.clicks),
        conversions: acc.conversions + Number(item.conversions),
        revenue: acc.revenue + Number(item.revenue),
        payout: acc.payout + Number(item.payout),
      }),
      { clicks: 0, conversions: 0, revenue: 0, payout: 0 }
    )
  }, [tableData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
         <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 rounded-none border-primary/20 text-primary hover:bg-primary/5"
        >
          <Sparkles className="size-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">AI Analyze</span>
        </Button>
      </div>

      <div className="rounded-none border border-muted/50 bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40 text-muted-foreground animate-pulse">
            <div className="flex flex-col items-center gap-4">
               <RefreshCw className="size-8 animate-spin opacity-20" />
               <span className="text-sm font-medium tracking-widest uppercase opacity-50">Loading real-time reports...</span>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              table={table}
              className="rounded-none border-none"
            />
            
            <div className="flex items-center justify-between border-t border-muted/50 bg-muted/30 px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-tight">
              <div className="flex items-center gap-12">
                <span className="text-muted-foreground italic lowercase font-normal text-xs opacity-50">Total Summary</span>
                <div className="flex gap-20">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground/70 leading-none">GrossClicks</span>
                    <span className="text-[14px] tracking-tighter tabular-nums">{formatCompactNumber(totals.clicks)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground/70 leading-none">Conversions</span>
                    <span className="text-[14px] tracking-tighter tabular-nums">{formatCompactNumber(totals.conversions)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground/70 leading-none">AdvertiserPrice</span>
                    <span className="text-[14px] tracking-tighter tabular-nums">{formatCurrency(totals.revenue)} <span className="text-[9px] opacity-50 ml-1">USD</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground/70 leading-none">AffiliatePayout</span>
                    <span className="text-[14px] tracking-tighter tabular-nums">{formatCurrency(totals.payout)} <span className="text-[9px] opacity-50 ml-1">USD</span></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 px-4 py-1 bg-primary/5 border border-primary/10">
                <span className="text-[9px] text-muted-foreground/70 leading-none">Net Profit</span>
                <span className="text-primary text-[18px] tracking-tighter tabular-nums font-black">{formatCurrency(totals.revenue - totals.payout)} <span className="text-[10px] opacity-70 ml-1">USD</span></span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 rounded-none border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-all"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? "size-3.5 animate-spin" : "size-3.5"} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Refresh</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-2 rounded-none border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-all">
          <Download className="size-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Export All (CSV)</span>
        </Button>
      </div>
    </div>
  )
}
