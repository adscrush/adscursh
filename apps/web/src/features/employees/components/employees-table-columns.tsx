"use client"

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
import { CalendarIcon, CircleDashed, Text } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Employee } from "../queries"
import { Ellipsis } from "lucide-react"
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconUserFilled,
} from "@tabler/icons-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@adscrush/ui/components/avatar"
import { Badge } from "@adscrush/ui/components/badge"

interface GetEmployeesTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<{
      row: { original: Employee }
      variant: "update" | "delete"
    } | null>
  >
}

export function getEmployeesTableColumns({
  setRowAction,
}: GetEmployeesTableColumnsProps): ColumnDef<Employee>[] {
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
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      cell: ({ row }) => {
        const name = (row.getValue("name") as string) || ""
        const image = row.original.image as string | null
        const initials =
          name
            .split(" ")
            .map((n) => n[0] || "")
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?"
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              {image && <AvatarImage src={image} alt={name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{name}</span>
          </div>
        )
      },
      meta: {
        label: "Name",
        placeholder: "Search name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      minSize: 200,
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ cell }) => (
        <span className="text-muted-foreground">{cell.getValue<string>()}</span>
      ),
      minSize: 200,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      cell: ({ cell }) => {
        const role = cell.getValue<string>()
        return (
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        )
      },
      minSize: 100,
    },
    {
      id: "departmentName",
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ cell }) => (
        <span className="text-muted-foreground">
          {cell.getValue<string>() || "-"}
        </span>
      ),
      minSize: 140,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
      enableSorting: true,
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: [
          { label: "Active", value: "active", icon: IconCircleCheckFilled },
          { label: "Inactive", value: "inactive", icon: IconCircleXFilled },
          { label: "Suspended", value: "suspended", icon: IconUserFilled },
        ],
        placeholder: "Search status...",
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
          {new Date(cell.getValue<Date>()).toLocaleDateString("en-US", {
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

function EmployeeStatusBadge({ status }: { status: Employee["status"] }) {
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
      ) : (
        <>
          <IconUserFilled className="size-3.5 text-orange-500 dark:text-orange-400" />
          <span>Suspended</span>
        </>
      )}
    </Badge>
  )
}
