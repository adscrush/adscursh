"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@adscrush/ui/components/button"
import { Input } from "@adscrush/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { Badge } from "@adscrush/ui/components/badge"
import { IconPlus, IconLoader2 } from "@tabler/icons-react"

// Lyte Nyte Grid Core
import { Grid, useClientDataSource } from "@1771technologies/lytenyte-core"
import "@1771technologies/lytenyte-core/grid.css"
import "@1771technologies/lytenyte-core/shadcn.css"

import { AddAdvertiserDialog } from "@/features/advertisers/components/add-advertiser-dialog"

interface Advertiser {
  id: string
  name: string
  companyName: string | null
  email: string
  website: string | null
  country: string | null
  status: "active" | "inactive" | "pending"
  accountManagerId: string | null
  accountManager?: {
    id: string
    name: string
  }
  createdAt: string
}

function StatusBadge({ status }: { status: Advertiser["status"] }) {
  const variants: Record<
    Advertiser["status"],
    "default" | "secondary" | "outline"
  > = {
    active: "default",
    inactive: "secondary",
    pending: "outline",
  }
  return <Badge variant={variants[status]}>{status}</Badge>
}

export default function AdvertisersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || ""
  const statusFilter = searchParams.get("status") || "all"

  const fetchAdvertisers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "10")
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await api.advertisers.get(params.toString() as never)
      if (response.data?.success && response.data.data) {
        setAdvertisers(response.data.data)
        setTotalPages(response.data.totalPages || 1)
      }
    } catch (error) {
      console.error("Failed to fetch advertisers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvertisers()
  }, [page, search, statusFilter])

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`/advertisers?${params.toString()}`)
  }

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    params.set("page", "1")
    router.push(`/advertisers?${params.toString()}`)
  }

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    return `/advertisers?${params.toString()}`
  }

  const ds = useClientDataSource<Advertiser>({
    data: advertisers,
  })

  const columns = useMemo<Grid.Column<Advertiser>[]>(
    () => [
      {
        id: "name",
        name: "Name",
        width: 200,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4">
            <Link
              href={`/advertisers/${props.row.data.id}`}
              className="font-medium text-primary hover:underline"
            >
              {props.row.data.name}
            </Link>
          </div>
        ),
      },
      {
        id: "companyName",
        name: "Company",
        width: 180,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4">
            {props.row.data.companyName || "-"}
          </div>
        ),
      },
      {
        id: "email",
        name: "Email",
        width: 250,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4 text-muted-foreground">
            {props.row.data.email}
          </div>
        ),
      },
      {
        id: "website",
        name: "Website",
        width: 150,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4">
            {props.row.data.website ? (
              <a
                href={props.row.data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit
              </a>
            ) : (
              "-"
            )}
          </div>
        ),
      },
      {
        id: "accountManager",
        name: "Account Manager",
        width: 200,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4">
            {props.row.data.accountManager?.name || "-"}
          </div>
        ),
      },
      {
        id: "status",
        name: "Status",
        width: 120,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4">
            <StatusBadge status={props.row.data.status} />
          </div>
        ),
      },
      {
        id: "createdAt",
        name: "Created",
        width: 150,
        cellRenderer: (props) => (
          <div className="flex h-full items-center px-4 text-muted-foreground">
            {new Date(props.row.data.createdAt).toLocaleDateString()}
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="flex h-full flex-col space-y-6">
      <PageHeader
        title="Advertisers"
        description="Manage your advertiser partnerships"
      >
        <AddAdvertiserDialog onCreated={fetchAdvertisers}>
          <Button>
            <IconPlus className="mr-2 size-4" />
            Create Advertiser
          </Button>
        </AddAdvertiserDialog>
      </PageHeader>

      <div className="flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search advertisers..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e.currentTarget.value)
              }
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="h-[600px] w-full lg:h-[calc(100vh-320px)]">
          {loading ? (
            <div className="flex h-full items-center justify-center space-x-2 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin" />
              <span>Loading advertisers...</span>
            </div>
          ) : advertisers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No advertisers found
            </div>
          ) : (
            <Grid columns={columns} rowSource={ds} />
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => router.push(buildPageUrl(page - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => router.push(buildPageUrl(p))}
                    >
                      {p}
                    </Button>
                  )
                }
                if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => router.push(buildPageUrl(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
