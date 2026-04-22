import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getDashboardAnalyticsQueryOptions } from "@/features/dashboard/queries"
import { DashboardClient } from "@/features/dashboard/client"
import type { DashboardPeriod } from "@/features/dashboard/types"

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams
  const period = (searchParams.period as DashboardPeriod) || "1m"

  const queryClient = new QueryClient()
  await queryClient.ensureQueryData(getDashboardAnalyticsQueryOptions({ period }))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
