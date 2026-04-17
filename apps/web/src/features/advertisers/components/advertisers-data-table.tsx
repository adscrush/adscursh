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

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/parsers"
import { parseAsInteger, parseAsStringEnum, useQueryStates } from "nuqs"
import type { Advertiser } from "../queries"
import { useAdvertisers } from "../queries"
import type { GetAdvertisersSchema } from "../validations"
import { AdvertisersTableActionBar } from "./advertiser-table-action-bar"
import { getAdvertisersTableColumns } from "./advertisers-table-columns"
import { DeleteAdvertisersDialog } from "./delete-advertisers-dialog"
import { UpdateAdvertiserDialog } from "./update-advertiser-dialog"

interface AdvertisersDataTableProps {
  search: GetAdvertisersSchema
  queryKeys?: Partial<QueryKeys>
}

export function AdvertisersDataTable({
  search,
  queryKeys,
}: AdvertisersDataTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  const [states] = useQueryStates({
    page: parseAsInteger.withDefault(search.page),
    perPage: parseAsInteger.withDefault(search.perPage),
    sort: getSortingStateParser<
      Omit<Advertiser, "accountManager">
    >().withDefault([{ id: "createdAt", desc: true }]),
    filters: getFiltersStateParser().withDefault([]),
    joinOperator: parseAsStringEnum(["and", "or"]).withDefault(
      search.joinOperator
    ),
  })

  const params = {
    ...search,
    page: states.page,
    perPage: states.perPage,
    sort: states.sort ?? [{ id: "createdAt", desc: true }],
    filters: states.filters ?? [],
    joinOperator: (states.joinOperator ?? "and") as "and" | "or",
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
        <DataTable
          table={table}
          actionBar={<AdvertisersTableActionBar table={table} />}
        >
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
