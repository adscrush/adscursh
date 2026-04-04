"use client"

import { useEffect, useState } from "react"
import { env } from "@/env"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"

interface OverviewData {
  clicks: number
  conversions: number
  revenue: number
  payout: number
  profit: number
  conversionRate: number
}

async function fetchOverview(): Promise<OverviewData> {
  const baseUrl = env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${baseUrl}/api/v1/reports/overview`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to fetch overview")
  const json = await res.json()
  return json.data
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   fetchOverview()
  //     .then(setOverview)
  //     .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  //     .finally(() => setLoading(false))
  // }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your ad network performance"
      />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading stats...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
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
