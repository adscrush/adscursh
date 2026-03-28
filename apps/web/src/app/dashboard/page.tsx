"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { apiGet } from "@/lib/api-client"

interface OverviewData {
  clicks: number
  conversions: number
  revenue: number
  payout: number
  profit: number
  conversionRate: number
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ success: boolean; data: OverviewData }>("/api/reports/overview")
      .then((res) => setOverview(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your ad network performance"
      />

      {loading ? (
        <div className="text-muted-foreground text-sm">
          Loading stats...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Clicks (MTD)"
            value={overview?.clicks?.toLocaleString() ?? "0"}
          />
          <StatCard
            title="Conversions (MTD)"
            value={overview?.conversions?.toLocaleString() ?? "0"}
          />
          <StatCard
            title="Revenue"
            value={`$${(overview?.revenue ?? 0).toFixed(2)}`}
          />
          <StatCard
            title="Payout"
            value={`$${(overview?.payout ?? 0).toFixed(2)}`}
          />
          <StatCard
            title="Profit"
            value={`$${(overview?.profit ?? 0).toFixed(2)}`}
          />
          <StatCard
            title="CR%"
            value={`${(overview?.conversionRate ?? 0).toFixed(2)}%`}
          />
        </div>
      )}
    </div>
  )
}
