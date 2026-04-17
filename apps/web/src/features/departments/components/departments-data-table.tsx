"use client"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableProvider } from "@/providers/data-table-provider"
import { useFeatureFlags } from "@/providers/feature-flags-provider"
import * as React from "react"
import type { Department } from "../queries"
import { useDepartments } from "../queries"
import type { GetDepartmentsSchema } from "../validations"
import { DeleteDepartmentDialog } from "./delete-department-dialog"
import { getDepartmentsTableColumns } from "./departments-table-columns"
import { UpdateDepartmentDialog } from "./update-department-dialog"
import { DepartmentsTableActionBar } from "./departments-table-action-bar"

interface DepartmentsDataTableProps {
  search: GetDepartmentsSchema
}

export function DepartmentsDataTable({ search }: DepartmentsDataTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()
  const { data, isLoading } = useDepartments(search)

  const [rowAction, setRowAction] = React.useState<{
    row: { original: Department }
    variant: "update" | "delete"
  } | null>(null)

  const handleRowActionChange = (open: boolean) => {
    if (!open) {
      setRowAction(null)
    }
  }

  const columns = React.useMemo(
    () => getDepartmentsTableColumns({ setRowAction }),
    []
  )

  const { table, shallow, debounceMs, throttleMs, resizing } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"], left: ["select"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    enableColumnResizing: true,
  })

  return (
    <DataTableProvider table={table} resizing={resizing}>
      {isLoading ? (
        <DataTableSkeleton
          columnCount={5}
          rowCount={10}
          filterCount={1}
          withViewOptions={false}
          withPagination={true}
        />
      ) : (
        <DataTable table={table}>
          {enableAdvancedFilter ? (
            <DataTableAdvancedToolbar table={table} resizing={resizing}>
              <DataTableSortList table={table} align="start" />
              {filterFlag === "advancedFilters" ? (
                <DataTableFilterList
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                  align="start"
                />
              ) : (
                <DataTableFilterMenu
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                />
              )}
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} resizing={resizing}>
              <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
          )}
        </DataTable>
      )}

      <DepartmentsTableActionBar table={table} />

      <UpdateDepartmentDialog
        open={rowAction?.variant === "update"}
        onOpenChange={handleRowActionChange}
        department={rowAction?.row.original ?? null}
      />

      <DeleteDepartmentDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={handleRowActionChange}
        department={rowAction?.row.original ?? null}
      />
    </DataTableProvider>
  )
}
