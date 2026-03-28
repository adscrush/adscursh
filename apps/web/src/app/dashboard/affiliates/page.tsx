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

interface Affiliate {
  id: string
  name: string
  companyName: string | null
  email: string
  status: string
  createdAt: string
}

const columns: ColumnDef<Affiliate>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "companyName", header: "Company" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/affiliates/${row.original.id}`}>
        <Button variant="ghost" size="sm">View</Button>
      </Link>
    ),
  },
]

export default function AffiliatesPage() {
  const [data, setData] = useState<Affiliate[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    apiGet<{ data: Affiliate[]; meta: { totalPages: number } }>(
      "/api/affiliates",
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
      await apiPost("/api/affiliates", {
        name: form.get("name"),
        companyName: form.get("companyName") || undefined,
        email: form.get("email"),
        status: form.get("status") || "active",
      })
      setDialogOpen(false)
      fetchData()
    } catch {
      // error
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliates" description="Manage affiliate partners">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><IconPlus className="mr-1 size-4" /> Create Affiliate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Affiliate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input name="companyName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <DataTable columns={columns} data={data} pageCount={totalPages} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
