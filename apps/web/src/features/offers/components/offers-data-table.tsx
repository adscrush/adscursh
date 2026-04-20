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
import type { QueryKeys } from "@adscrush/shared/types/data-table"
import * as React from "react"

import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/parsers"
import { parseAsInteger, parseAsStringEnum, useQueryStates } from "nuqs"
import { useOffers } from "../queries"
import type { GetOffersSchema, OfferListSortableColumns } from "../validations"
import { getOffersTableColumns } from "./offers-table-columns"

interface OffersDataTableProps {
  search: GetOffersSchema
  queryKeys?: Partial<QueryKeys>
}

export function OffersDataTable({ search, queryKeys }: OffersDataTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  const [states] = useQueryStates({
    page: parseAsInteger.withDefault(search.page),
    perPage: parseAsInteger.withDefault(search.perPage),
    sort: getSortingStateParser<OfferListSortableColumns>().withDefault([
      { id: "createdAt", desc: true },
    ]),
    filters: getFiltersStateParser().withDefault([]),
    joinOperator: parseAsStringEnum(["and", "or"]).withDefault(
      search.joinOperator
    ),
  })

  // These stay in sync with live URL params (set by useDataTable)
  const params: GetOffersSchema = {
    ...search,
    page: states.page,
    perPage: states.perPage,
    sort: states.sort ?? [{ id: "createdAt", desc: true }],
    filters: states.filters ?? [],
    joinOperator: (states.joinOperator ?? "and") as "and" | "or",
  }

  const { data, isLoading, isFetching } = useOffers(params)

  const columns = React.useMemo(
    () => getOffersTableColumns({ setRowAction: () => {} }),
    []
  )

  const { table, shallow, debounceMs, throttleMs, resizing } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta?.totalPages ?? 0,
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
            <DataTableAdvancedToolbar
              table={table}
              resizing={resizing}
              extra={<DataTableSearch isFetching={isFetching} name="search" />}
            >
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
            <DataTableToolbar
              table={table}
              resizing={resizing}
              isFetching={isFetching}
              searchName="search"
            >
              <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
          )}
        </DataTable>
      )}
    </DataTableProvider>
  )
}
