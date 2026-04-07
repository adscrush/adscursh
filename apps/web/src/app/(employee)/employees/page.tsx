import { SiteHeader } from "@/components/layout/site-header"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { SearchParams } from "@/types"
import { Suspense } from "react"
import { FeatureFlagsProvider } from "@/providers/feature-flags-provider"
import { EmployeesTable } from "./data-table/components/employee-table"
import { getEmployees, getEmployeeStatusCounts } from "./data-table/lib/queries"
import { searchParamsCache } from "./data-table/lib/validations"

interface EmployeesPageProps {
  searchParams: Promise<SearchParams>
}

export default function EmployeesPage(props: EmployeesPageProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <Suspense
            fallback={
              <DataTableSkeleton
                columnCount={6}
                rowCount={10}
                filterCount={2}
                withViewOptions={true}
                withPagination={true}
              />
            }
          >
            <FeatureFlagsProvider
              defaultFilterFlag="commandFilters"
              showToggleGroup={false}
            >
              <EmployeesTableWrapper {...props} />
            </FeatureFlagsProvider>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function EmployeesTableWrapper(props: EmployeesPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const promises = Promise.all([
    getEmployees({
      ...search,
    }),
    getEmployeeStatusCounts(),
  ])

  return (
    <EmployeesTable
      promises={promises}
      queryKeys={{
        page: "page",
        perPage: "perPage",
        sort: "sort",
        filters: "filters",
        joinOperator: "joinOperator",
      }}
      search={search}
    />
  )
}
