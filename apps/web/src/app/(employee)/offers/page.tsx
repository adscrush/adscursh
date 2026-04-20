import { PageHeader } from "@/components/common/page-header"
import { Button } from "@adscrush/ui/components/button"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"
import { SearchParams } from "@/types"
import { searchParamsCache } from "@/features/offers/validations"
import { getOffersQueryOptions } from "@/features/offers/queries"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { OffersDataTable } from "@/features/offers/components/offers-data-table"
import { Suspense } from "react"
import { FeatureFlagsProvider } from "@/providers/feature-flags-provider"

interface OffersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function OffersPage(props: OffersPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)
  const queryClient = new QueryClient()

  await queryClient.ensureQueryData(getOffersQueryOptions(search))

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Offers" description="Manage your affiliate offers">
        <Button size="sm" asChild>
          <Link href="/offers/new">
            <IconPlus className="mr-2 size-3.5" />
            Create Offer
          </Link>
        </Button>
      </PageHeader>
      
      <div className="flex flex-1 flex-col gap-4">
        <Suspense fallback={<div>Loading...</div>}>
          <FeatureFlagsProvider
            defaultFilterFlag="commandFilters"
            showToggleGroup={false}
          >
            <HydrationBoundary state={dehydrate(queryClient)}>
              <OffersDataTable 
                search={search} 
              />
            </HydrationBoundary>
          </FeatureFlagsProvider>
        </Suspense>
      </div>
    </div>
  )
}
