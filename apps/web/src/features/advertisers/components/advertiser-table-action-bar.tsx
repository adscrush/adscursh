"use client"

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@adscrush/ui/components/action-bar"
import { advertisers } from "@adscrush/db/schema"
import { exportTableToCSV } from "@adscrush/shared/lib/export"
import type { Table } from "@tanstack/react-table"
import { CheckCircle2, Download, Trash2, X } from "lucide-react"
import * as React from "react"
import { toast } from "@adscrush/ui/sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adscrush/ui/components/dropdown-menu"
import { Advertiser, useUpdateAdvertiser } from "../queries"

interface AdvertisersTableActionBarProps {
  table: Table<Advertiser>
}

export function AdvertisersTableActionBar({
  table,
}: AdvertisersTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows
  const { mutateAsync: updateAdvertiser } = useUpdateAdvertiser()

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  const onAdvertiserUpdate = React.useCallback(
    (field: "status", value: Advertiser["status"]) => {
      async function update() {
        const { error } = await updateAdvertiserStatus({
          ids: rows.map((row) => row.original.id),
          [field]: value,
        })

        if (error) {
          toast.error(error)
          return
        }
        toast.success("Advertisers updated")
      }
      update()
    },
    [rows]
  )

  const onAdvertiserExport = React.useCallback(() => {
    exportTableToCSV(table, {
      excludeColumns: ["select", "actions"],
      onlySelected: true,
    })
  }, [table])

  const onAdvertiserDelete = React.useCallback(() => {
    async function remove() {
      const { error } = await deleteAdvertisers({
        ids: rows.map((row) => row.original.id),
      })

      if (error) {
        toast.error(error)
        return
      }
      table.toggleAllRowsSelected(false)
    }
    remove()
  }, [rows, table])

  return (
    <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
      <ActionBarSelection>
        <span className="font-medium">{rows.length}</span>
        <span>selected</span>
        <ActionBarSeparator />
        <ActionBarClose>
          <X />
        </ActionBarClose>
      </ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ActionBarItem>
              <CheckCircle2 />
              Status
            </ActionBarItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {advertisers.status.enumValues.map((status) => (
              <DropdownMenuItem
                key={status}
                className="capitalize"
                onClick={() => onAdvertiserUpdate("status", status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ActionBarItem onClick={onAdvertiserExport}>
          <Download />
          Export
        </ActionBarItem>
        <ActionBarItem variant="destructive" onClick={onAdvertiserDelete}>
          <Trash2 />
          Delete
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  )
}
