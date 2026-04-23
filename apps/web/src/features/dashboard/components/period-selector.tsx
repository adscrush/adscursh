"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@adscrush/ui/components/tabs"
import { useRouter } from "next/navigation"
import type { DashboardPeriod } from "@/features/dashboard/types"

export function PeriodSelector({ period }: { period: DashboardPeriod }) {
  const router = useRouter()

  const handleChange = (value: string) => {
    router.replace(`?period=${value}`)
  }

  return (
    <Tabs value={period} onValueChange={handleChange}>
      <TabsList variant="default">
        <TabsTrigger value="1w">1w</TabsTrigger>
        <TabsTrigger value="1m">1m</TabsTrigger>
        <TabsTrigger value="3m">3m</TabsTrigger>
        <TabsTrigger value="12m">12m</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
