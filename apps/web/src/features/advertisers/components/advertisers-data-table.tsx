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
import type {
  DataTableRowAction,
  QueryKeys,
} from "@adscrush/shared/types/data-table"
import * as React from "react"

import { useAdvertisers } from "../queries"
import type { Advertiser } from "../queries"
import type { GetAdvertisersSchema } from "../validations"
import { getAdvertisersTableColumns } from "./advertisers-table-columns"
import { UpdateAdvertiserDialog } from "./update-advertiser-dialog"
import { DeleteAdvertisersDialog } from "./delete-advertisers-dialog"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/parsers"

interface AdvertisersDataTableProps {
  search: GetAdvertisersSchema
  queryKeys?: Partial<QueryKeys>
}

export function AdvertisersDataTable({
  search,
  queryKeys,
}: AdvertisersDataTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  // These stay in sync with live URL params (set by useDataTable)
  const pageState = useQueryState(
    queryKeys?.page ?? "page",
    parseAsInteger.withDefault(search.page)
  )
  const perPageState = useQueryState(
    queryKeys?.perPage ?? "perPage",
    parseAsInteger.withDefault(search.perPage)
  )
  const [sorting] = useQueryState(
    queryKeys?.sort ?? "sort",
    getSortingStateParser<Omit<Advertiser, "accountManager">>().withDefault([
      { id: "createdAt", desc: true },
    ])
  )
  const [filters] = useQueryState(
    queryKeys?.filters ?? "filters",
    getFiltersStateParser().withDefault([])
  )
  const [joinOperator] = useQueryState(
    queryKeys?.joinOperator ?? "joinOperator",
    parseAsString.withDefault(search.joinOperator)
  )

  const params = {
    ...search,
    page: pageState[0],
    perPage: perPageState[0] ?? perPageState[1],
    sort: sorting ?? [{ id: "createdAt", desc: true }],
    filters: filters ?? [],
    joinOperator: (joinOperator ?? "and") as "and" | "or",
  }

  const { data, isLoading } = useAdvertisers(params)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Advertiser> | null>(null)

  const handleRowActionChange = (open: boolean) => {
    if (!open) {
      setRowAction(null)
    }
  }

  const columns = React.useMemo(
    () => getAdvertisersTableColumns({ setRowAction }),
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

      <UpdateAdvertiserDialog
        open={rowAction?.variant === "update"}
        onOpenChange={handleRowActionChange}
        advertiser={rowAction?.row.original ?? null}
      />

      <DeleteAdvertisersDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={handleRowActionChange}
        advertisers={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </DataTableProvider>
  )
}
