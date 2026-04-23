"use client"

import { MetricHero } from "./components/metric-hero"
import { RevenueChart } from "./components/revenue-chart"
import { CustomerVennPanel } from "./components/customer-venn-panel"
import { GeographyPanel } from "./components/geography-panel"
import { ActiveOffersPanel } from "./components/active-offers-panel"
import { useDashboardAnalytics } from "./queries"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import type { DashboardPeriod } from "./types"

export function DashboardClient() {
  const period: DashboardPeriod = "12m"

  const { data, isLoading, error } = useDashboardAnalytics({ period })

  if (isLoading) {
    return (
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex w-full flex-col overflow-hidden rounded-xl border bg-background md:flex-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 border-b p-6 last:border-0 md:border-r md:border-b-0">
              <Skeleton className="mb-4 h-4 w-24" />
              <Skeleton className="mb-2 h-8 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[350px] lg:col-span-2" />
          <div className="space-y-6">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    )
  }

  const { summary, trends, revenueByPeriod, customerSegments, geography, activeOffersList } = data

  return (
    <div className="-m-6 flex flex-col rounded-none bg-background">
      <div className="flex items-center justify-between border-b border-border bg-background p-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <MetricHero
        metrics={[
          {
            label: "Today's Revenue",
            value: summary.totalRevenue,
            trend: trends.revenueChange,
            format: "currency",
          },
          {
            label: "Today's CR",
            value: summary.conversionRate,
            trend: trends.conversionRateChange,
            format: "percentage",
          },
          {
            label: "Today's Conversions",
            value: summary.totalConversions,
            trend: trends.conversionsChange,
            format: "number",
          },
          {
            label: "Today's Clicks",
            value: summary.totalClicks,
            trend: trends.clicksChange,
            format: "number",
          },
        ]}
      />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 border-b border-border lg:grid-cols-3">
        <div className="border-b border-border lg:col-span-2 lg:border-r lg:border-b-0">
          <RevenueChart
            data={revenueByPeriod}
            currentTotal={summary.totalRevenue}
            trend={trends.revenueChange}
            comparisons={trends.revenueComparisons}
          />
        </div>
        <div className="lg:col-span-1">
          <CustomerVennPanel
            segments={customerSegments}
            totalConversions={summary.totalConversions}
            totalTrend={trends.conversionsChange}
          />
        </div>
      </div>

      {/* Bottom Grid: Geography & Active Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="border-b border-border lg:col-span-1 lg:border-r lg:border-b-0">
          <GeographyPanel geography={geography} totalConversions={summary.totalConversions} />
        </div>
        <div className="lg:col-span-2">
          <ActiveOffersPanel offers={activeOffersList} />
        </div>
      </div>
    </div>
  )
}
