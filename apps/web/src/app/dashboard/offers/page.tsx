"use client"

import { useEffect, useState, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@adscrush/ui/components/button"
import { apiGet } from "@/lib/api-client"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"

interface Offer {
  id: string
  name: string
  advertiserId: string
  status: string
  payoutType: string
  defaultPayout: string
  defaultRevenue: string
  targetGeo: string | null
  createdAt: string
}

const columns: ColumnDef<Offer>[] = [
  { accessorKey: "name", header: "Offer" },
  { accessorKey: "payoutType", header: "Type" },
  { accessorKey: "targetGeo", header: "Geo" },
  {
    accessorKey: "defaultRevenue",
    header: "Revenue",
    cell: ({ row }) => `$${Number(row.getValue("defaultRevenue")).toFixed(2)}`,
  },
  {
    accessorKey: "defaultPayout",
    header: "Payout",
    cell: ({ row }) => `$${Number(row.getValue("defaultPayout")).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/offers/${row.original.id}`}>
        <Button variant="ghost" size="sm">View</Button>
      </Link>
    ),
  },
]

export default function OffersPage() {
  const [data, setData] = useState<Offer[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    apiGet<{ data: Offer[]; meta: { totalPages: number } }>(
      "/api/offers",
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

  return (
    <div className="space-y-6">
      <PageHeader title="Offers" description="Manage advertising offers">
        <Link href="/offers/create">
          <Button><IconPlus className="mr-1 size-4" /> Create Offer</Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <DataTable columns={columns} data={data} pageCount={totalPages} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
