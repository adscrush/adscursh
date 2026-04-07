"use client"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableProvider } from "@/providers/data-table-provider"
import type { DataTableRowAction, QueryKeys } from "@/types/data-table"
import * as React from "react"

import type { getEmployees, getEmployeeStatusCounts } from "../lib/queries"
import type { Employee } from "../lib/types"
import type { GetEmployeesSchema } from "../lib/validations"
import { useFeatureFlags } from "@/providers/feature-flags-provider"
import { getEmployeesTableColumns } from "./employee-table-columns"
import { UpdateEmployeeDialog } from "./actions/update-employee-dialog"
import { AddEmployeeDialog } from "@/features/employees/components/add-employee-dialog"

interface EmployeesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getEmployees>>,
      Awaited<ReturnType<typeof getEmployeeStatusCounts>>,
    ]
  >
  queryKeys?: Partial<QueryKeys>
  search: GetEmployeesSchema
}

export function EmployeesTable({
  promises,
  queryKeys,
  search,
}: EmployeesTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  const [{ data, pageCount }, _statusCounts] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Employee> | null>(null)

  const handleRowActionChange = (open: boolean) => {
    if (!open) {
      setRowAction(null)
    }
  }

  const columns = React.useMemo(
    () => getEmployeesTableColumns({ setRowAction }),
    []
  )

  const { table, shallow, debounceMs, throttleMs, resizing } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"], left: ["select"] },
    },
    queryKeys,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    enableColumnResizing: true,
  })

  return (
    <DataTableProvider table={table} resizing={resizing}>
      <DataTable table={table}>
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table} resizing={resizing}>
            <DataTableSortList table={table} align="start" />
            {filterFlag === "advancedFilters" ? (
              <>
                <DataTableFilterList
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                  align="start"
                />
                <AddEmployeeDialog />
              </>
            ) : (
              <>
                <DataTableFilterMenu
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                />
                <AddEmployeeDialog />
              </>
            )}
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} resizing={resizing}>
            <AddEmployeeDialog />
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>

      <UpdateEmployeeDialog
        open={rowAction?.variant === "update"}
        onOpenChange={handleRowActionChange}
        employee={rowAction?.row.original ?? null}
      />
    </DataTableProvider>
  )
}
