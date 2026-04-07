import { PageHeader } from "@/components/common/page-header"
import { AddAdvertiserDialog } from "@/features/advertisers/components/add-advertiser-dialog"
import { AdvertisersDataTable } from "@/features/advertisers/components/advertisers-data-table"
import { getAdvertisersQueryOptions } from "@/features/advertisers/queries"
import { searchParamsCache } from "@/features/advertisers/validations"
import { FeatureFlagsProvider } from "@/providers/feature-flags-provider"
import { Button } from "@adscrush/ui/components/button"
import { SearchParams } from "@/types"
import { IconPlus } from "@tabler/icons-react"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { Suspense } from "react"

interface AdvertisersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function AdvertisersPage(props: AdvertisersPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)
  const queryClient = new QueryClient()

  await queryClient.ensureQueryData(
    getAdvertisersQueryOptions({
      page: search.page,
      perPage: search.perPage,
      ...(search.name ? { search: search.name } : {}),
      ...(search.status.length > 0 ? { status: search.status.join(",") } : {}),
    })
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Advertisers" description="Manage your advertisers">
        <AddAdvertiserDialog>
          <Button variant="outline" size="sm">
            <IconPlus className="mr-2 size-3.5" />
            Add Advertiser
          </Button>
        </AddAdvertiserDialog>
      </PageHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Suspense>
            <FeatureFlagsProvider
              defaultFilterFlag="commandFilters"
              showToggleGroup={false}
            >
              <HydrationBoundary state={dehydrate(queryClient)}>
                <AdvertisersDataTable
                  search={search}
                  queryKeys={{
                    page: "page",
                    perPage: "perPage",
                    sort: "sort",
                    filters: "filters",
                    joinOperator: "joinOperator",
                  }}
                />
              </HydrationBoundary>
            </FeatureFlagsProvider>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
