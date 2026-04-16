"use client"

import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { useState } from "react"

interface OverviewData {
  clicks: number
  conversions: number
  revenue: number
  payout: number
  profit: number
  conversionRate: number
}

export default function DashboardPage() {
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
    </div>
  )
}
