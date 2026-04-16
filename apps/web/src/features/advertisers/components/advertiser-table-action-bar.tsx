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
import {
  Advertiser,
  useDeleteAdvertiser,
  useUpdateAdvertiser,
} from "../queries"

interface AdvertisersTableActionBarProps {
  table: Table<Advertiser>
}

export function AdvertisersTableActionBar({
  table,
}: AdvertisersTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows
  const { mutateAsync: updateAdvertiser } = useUpdateAdvertiser()
  const { mutateAsync: deleteAdvertiser } = useDeleteAdvertiser()

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  const onAdvertiserUpdate = React.useCallback(
    async (field: "status", value: Advertiser["status"]) => {
      try {
        await Promise.all(
          rows.map((row) =>
            updateAdvertiser({
              id: row.original.id,
              [field]: value,
            })
          )
        )
        toast.success("Advertisers updated")
      } catch {
        toast.error("Failed to update advertisers")
      }
    },
    [rows, updateAdvertiser]
  )

  const onAdvertiserExport = React.useCallback(() => {
    exportTableToCSV(table, {
      excludeColumns: ["select", "actions"],
      onlySelected: true,
    })
  }, [table])

  const onAdvertiserDelete = React.useCallback(async () => {
    try {
      await Promise.all(rows.map((row) => deleteAdvertiser(row.original.id)))
      table.toggleAllRowsSelected(false)
      toast.success("Advertisers deleted")
    } catch {
      toast.error("Failed to delete advertisers")
    }
  }, [rows, table, deleteAdvertiser])

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
