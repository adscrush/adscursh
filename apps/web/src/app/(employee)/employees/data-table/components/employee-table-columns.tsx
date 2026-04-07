"use client"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@adscrush/ui/components/button"
import { Checkbox } from "@adscrush/ui/components/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@adscrush/ui/components/dropdown-menu"
import { Badge } from "@adscrush/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@adscrush/ui/components/avatar"
import type { DataTableRowAction } from "@/types/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarIcon, CircleDashed, Ellipsis, Text } from "lucide-react"
import { IconCircleCheckFilled, IconCircleXFilled, IconBan } from "@tabler/icons-react"
import { formatDate } from "@adscrush/shared/lib/format"
import type { Employee } from "../lib/types"

interface GetEmployeesTableColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Employee> | null>>
}

export function getEmployeesTableColumns({ setRowAction }: GetEmployeesTableColumnsProps): ColumnDef<Employee>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          className="translate-y-0.5"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => <Checkbox aria-label="Select row" className="translate-y-0.5" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
    },
    {
      id: "account",
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Employee" />,
      cell: ({ row }) => {
        const emp = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={emp.image || undefined} />
              <AvatarFallback className="text-xs font-medium">
                {emp.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col -space-y-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {emp.name}
              </span>
              <span className="text-xs text-muted-foreground truncate font-mono">
                {emp.email}
              </span>
            </div>
          </div>
        )
      },
      meta: {
        label: "Employee",
        placeholder: "Search employee...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      minSize: 250,
    },
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id.slice(-6)}
        </span>
      ),
      enableSorting: false,
      minSize: 100,
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Role" />,
      cell: ({ row }) => <StatusBadge status={row.original.role === "admin" ? "active" : "inactive"} label={row.original.role === "admin" ? "Admin" : "Employee"} />,
      enableSorting: true,
      meta: {
        label: "Role",
        variant: "multiSelect",
        options: [
          { label: "Admin", value: "admin", icon: CircleDashed },
          { label: "Employee", value: "employee", icon: CircleDashed },
        ],
        icon: CircleDashed,
      },
      enableColumnFilter: true,
      minSize: 120,
    },
    {
      id: "department",
      accessorKey: "department",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Department" />,
      cell: ({ cell }) => (
        <span className="text-sm text-muted-foreground">
          {cell.getValue<string>() || "—"}
        </span>
      ),
      meta: {
        label: "Department",
        placeholder: "Search department...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      minSize: 150,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Joined" />,
      cell: ({ cell }) => {
        return <span className="text-sm text-muted-foreground">{formatDate(cell.getValue<Date>())}</span>
      },
      meta: {
        label: "Joined",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
      minSize: 160,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
      enableSorting: true,
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: [
          { label: "Active", value: "active", icon: IconCircleCheckFilled },
          { label: "Inactive", value: "inactive", icon: IconCircleXFilled },
          { label: "Suspended", value: "suspended", icon: IconBan },
        ],
        icon: CircleDashed,
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
              <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => setRowAction({ row, variant: "update" })}>
                Edit
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
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

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  return (
    <Badge variant="outline" className="gap-1.5 px-2">
      <span
        className={`size-1.5 rounded-full ${
          status === "active" ? "bg-green-500" : status === "inactive" ? "bg-gray-400" : "bg-red-500"
        }`}
      />
      <span>{label}</span>
    </Badge>
  )
}

const EmployeeStatusBadge = ({ status }: { status: Employee["status"] }) => {
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
          <IconBan className="size-3.5 text-red-500 dark:text-red-400" />
          <span>Suspended</span>
        </>
      )}
    </Badge>
  )
}
