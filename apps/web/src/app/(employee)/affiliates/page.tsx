import { PageHeader } from "@/components/common/page-header"
import { AddAffiliateDialog } from "@/features/affiliates/components/add-affiliate-dialog"
import { AffiliatesDataTable } from "@/features/affiliates/components/affiliates-data-table"
import { getAffiliatesQueryOptions } from "@/features/affiliates/queries"
import { searchParamsCache } from "@/features/affiliates/validations"
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

interface AffiliatesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function AffiliatesPage(props: AffiliatesPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)
  const queryClient = new QueryClient()

  await queryClient.ensureQueryData(getAffiliatesQueryOptions(search))

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Affiliates" description="Manage your affiliates">
        <AddAffiliateDialog>
          <Button size="sm">
            <IconPlus className="mr-2 size-3.5" />
            Add Affiliate
          </Button>
        </AddAffiliateDialog>
      </PageHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Suspense>
            <FeatureFlagsProvider
              defaultFilterFlag="commandFilters"
              showToggleGroup={false}
            >
              <HydrationBoundary state={dehydrate(queryClient)}>
                <AffiliatesDataTable
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
