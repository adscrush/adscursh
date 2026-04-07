"use client"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableProvider } from "@/providers/data-table-provider"
import { useFeatureFlags } from "@/providers/feature-flags-provider"
import type { DataTableRowAction, QueryKeys } from "@/types/data-table"
import * as React from "react"

import { useAffiliates } from "../queries"
import type { Affiliate } from "../queries"
import type { GetAffiliatesSchema } from "../validations"
import { getAffiliatesTableColumns } from "./affiliates-table-columns"
import { UpdateAffiliateDialog } from "./update-affiliate-dialog"
import { DeleteAffiliatesDialog } from "./delete-affiliates-dialog"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

interface AffiliatesDataTableProps {
  search: GetAffiliatesSchema
  queryKeys?: Partial<QueryKeys>
}

export function AffiliatesDataTable({ search, queryKeys }: AffiliatesDataTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  const { data, isLoading } = useAffiliates({
    page: search.page,
    perPage: search.perPage,
    ...(search.name ? { search: search.name } : {}),
    ...(search.status.length > 0 ? { status: search.status.join(",") } : {}),
  })

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Affiliate> | null>(null)

  const handleRowActionChange = (open: boolean) => {
    if (!open) {
      setRowAction(null)
    }
  }

  const columns = React.useMemo(
    () => getAffiliatesTableColumns({ setRowAction }),
    []
  )

  const { table, shallow, debounceMs, throttleMs, resizing } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
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
      {isLoading ? (
        <DataTableSkeleton
          columnCount={6}
          rowCount={10}
          filterCount={2}
          withViewOptions={true}
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

      <UpdateAffiliateDialog
        open={rowAction?.variant === "update"}
        onOpenChange={handleRowActionChange}
        affiliate={rowAction?.row.original ?? null}
      />

      <DeleteAffiliatesDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={handleRowActionChange}
        affiliates={
          rowAction?.row.original ? [rowAction?.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </DataTableProvider>
  )
}
