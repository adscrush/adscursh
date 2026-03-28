"use client"

import { useEffect, useState, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import { Input } from "@adscrush/ui/components/input"
import { Label } from "@adscrush/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { apiGet, apiPost } from "@/lib/api-client"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string | null
  status: string
  createdAt: string
}

const columns: ColumnDef<Employee>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "department", header: "Department" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/employees/${row.original.id}`}>
        <Button variant="ghost" size="sm">View</Button>
      </Link>
    ),
  },
]

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    apiGet<{ data: Employee[]; meta: { totalPages: number } }>(
      "/api/employees",
      { page, limit: 20 }
    )
      .then((res) => {
        setData(res.data)
        setTotalPages(res.meta.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await apiPost("/api/employees", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role") || "employee",
        department: form.get("department") || undefined,
      })
      setDialogOpen(false)
      fetchData()
    } catch {
      // error handling
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Access" description="Manage employee accounts and permissions">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><IconPlus className="mr-1 size-4" /> Create Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={8} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="employee">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" />
                </div>
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
