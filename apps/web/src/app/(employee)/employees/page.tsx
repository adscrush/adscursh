import { PageHeader } from "@/components/common/page-header"
import { AddEmployeeDialog } from "@/features/employees/components/add-employee-dialog"
import { EmployeesDataTable } from "@/features/employees/components/employees-data-table"
import { getEmployeesQueryOptions } from "@/features/employees/queries"
import { searchParamsCache } from "@/features/employees/validations"
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

interface EmployeesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function EmployeesPage(props: EmployeesPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)
  const queryClient = new QueryClient()

  await queryClient.ensureQueryData(getEmployeesQueryOptions(search))

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Employees" description="Manage your employees">
        <AddEmployeeDialog>
          <Button size="sm">
            <IconPlus className="mr-2 size-3.5" />
            Add Employee
          </Button>
        </AddEmployeeDialog>
      </PageHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Suspense>
            <FeatureFlagsProvider
              defaultFilterFlag="commandFilters"
              showToggleGroup={false}
            >
              <HydrationBoundary state={dehydrate(queryClient)}>
                <EmployeesDataTable search={search} />
              </HydrationBoundary>
            </FeatureFlagsProvider>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
