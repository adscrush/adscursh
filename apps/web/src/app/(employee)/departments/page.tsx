import { PageHeader } from "@/components/common/page-header"
import { AddDepartmentDialog } from "@/features/departments/components/add-department-dialog"
import { DepartmentsDataTable } from "@/features/departments/components/departments-data-table"
import { getDepartmentsQueryOptions } from "@/features/departments/queries"
import { searchParamsCache } from "@/features/departments/validations"
import { Button } from "@adscrush/ui/components/button"
import { SearchParams } from "@/types"
import { IconPlus } from "@tabler/icons-react"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { Suspense } from "react"
import { FeatureFlagsProvider } from "@/providers/feature-flags-provider"

interface DepartmentsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function DepartmentsPage(props: DepartmentsPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)
  const queryClient = new QueryClient()

  await queryClient.ensureQueryData(getDepartmentsQueryOptions(search))

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Departments" description="Manage your departments">
        <AddDepartmentDialog>
          <Button size="sm">
            <IconPlus className="mr-2 size-3.5" />
            Add Department
          </Button>
        </AddDepartmentDialog>
      </PageHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Suspense>
            <FeatureFlagsProvider
              defaultFilterFlag="commandFilters"
              showToggleGroup={false}
            >
              <HydrationBoundary state={dehydrate(queryClient)}>
                <DepartmentsDataTable search={search} />
              </HydrationBoundary>
            </FeatureFlagsProvider>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
