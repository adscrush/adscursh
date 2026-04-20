import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@adscrush/ui/components/button"
import { Checkbox } from "@adscrush/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@adscrush/ui/components/dropdown-menu"
import { Badge } from "@adscrush/ui/components/badge"
import type { DataTableRowAction } from "@adscrush/shared/types/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { Offer } from "../queries"
import { CalendarIcon, CircleDashed, Ellipsis, Text } from "lucide-react"
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconPlayerPauseFilled,
  IconCircleFilled,
} from "@tabler/icons-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@adscrush/ui/components/avatar"

import Link from "next/link"

interface GetOffersTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Offer> | null>
  >
}

export function getOffersTableColumns({
  setRowAction,
}: GetOffersTableColumnsProps): ColumnDef<Offer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          className="translate-y-0.5"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          className="translate-y-0.5"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
    },
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/offers/${row.original.id}`}
          className="font-mono text-[10px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          {row.original.id}
        </Link>
      ),
      meta: {
        label: "ID",
        placeholder: "Search by ID...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableSorting: false,
      minSize: 100,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Offer" />
      ),
      cell: ({ row }) => {
        const logo = row.original.logo
        const name = row.original.name
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-8 rounded-lg">
              {logo ? <AvatarImage src={logo} alt={name} /> : null}
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{name}</span>
          </div>
        )
      },
      meta: {
        label: "Offer",
        placeholder: "Search offers...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      minSize: 180,
    },
    {
      id: "advertiser",
      accessorKey: "advertiser.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Advertiser" />
      ),
      cell: ({ row }) => {
        const advertiser = row.original.advertiser
        return (
          <span className="text-muted-foreground">
            {advertiser?.name || "-"}
          </span>
        )
      },
      meta: {
        label: "Advertiser",
        placeholder: "Search advertiser...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      minSize: 150,
    },
    {
      id: "payout",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Payout" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {row.original.defaultPayout} {row.original.currency}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {row.original.payoutType}
            </span>
          </div>
        )
      },
      minSize: 120,
    },
    {
      id: "revenue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Revenue" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-green-600 dark:text-green-400">
              {row.original.defaultRevenue} {row.original.currency}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {row.original.revenueType}
            </span>
          </div>
        )
      },
      minSize: 120,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => <OfferStatusBadge status={row.original.status} />,
      enableSorting: true,
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: [
          { label: "Active", value: "active", icon: IconCircleCheckFilled },
          { label: "Inactive", value: "inactive", icon: IconCircleXFilled },
          { label: "Paused", value: "paused", icon: IconPlayerPauseFilled },
          { label: "Expired", value: "expired", icon: IconCircleFilled },
        ],
        icon: CircleDashed,
      },
      enableColumnFilter: true,
      minSize: 120,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created" />
      ),
      cell: ({ cell }) => (
        <span className="text-muted-foreground">
          {new Date(cell.getValue<string>()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      ),
      meta: {
        label: "Created",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
      minSize: 120,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open action menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                Edit
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 50,
      maxSize: 50,
      minSize: 50,
      enableResizing: false,
    },
  ]
}

function OfferStatusBadge({
  status,
}: {
  status: "active" | "inactive" | "paused" | "expired"
}) {
  return (
    <Badge variant="outline" className="gap-1.5 px-2">
      {status === "active" ? (
        <>
          <IconCircleCheckFilled className="size-3.5 text-green-600 dark:text-green-400" />
          <span>Active</span>
        </>
      ) : status === "inactive" ? (
        <>
          <IconCircleXFilled className="size-3.5 text-gray-500 dark:text-gray-400" />
          <span>Inactive</span>
        </>
      ) : status === "paused" ? (
        <>
          <IconPlayerPauseFilled className="size-3.5 text-yellow-500 dark:text-yellow-400" />
          <span>Paused</span>
        </>
      ) : (
        <>
          <IconCircleFilled className="size-3.5 text-red-500 dark:text-red-400" />
          <span>Expired</span>
        </>
      )}
    </Badge>
  )
}
