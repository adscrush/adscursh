"use client"

import { useState, useEffect } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adscrush/ui/components/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@adscrush/ui/components/pagination"
import { IconPlus } from "@tabler/icons-react"

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
  const status = searchParams.get("status") || "all"

  useEffect(() => {
    async function fetchAdvertisers() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", "10")
        if (search) params.set("search", search)
        if (status !== "all") params.set("status", status)

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
    fetchAdvertisers()
  }, [page, search, status])

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisers"
        description="Manage your advertiser partnerships"
      >
        <Link href="/advertisers/new">
          <Button>
            <IconPlus className="mr-2 size-4" />
            Create Advertiser
          </Button>
        </Link>
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
        <Select value={status} onValueChange={handleStatusFilter}>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Account Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : advertisers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-muted-foreground"
                >
                  No advertisers found
                </TableCell>
              </TableRow>
            ) : (
              advertisers.map((advertiser) => (
                <TableRow key={advertiser.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/advertisers/${advertiser.id}`}
                      className="hover:underline"
                    >
                      {advertiser.name}
                    </Link>
                  </TableCell>
                  <TableCell>{advertiser.companyName || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {advertiser.email}
                  </TableCell>
                  <TableCell>
                    {advertiser.website ? (
                      <a
                        href={advertiser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {advertiser.accountManager?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={advertiser.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(advertiser.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildPageUrl(page - 1)}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            {page > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildPageUrl(page - 1)} />
              </PaginationItem>
            )}
            <PaginationItem>
              <Badge variant="outline">{page}</Badge>
            </PaginationItem>
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={buildPageUrl(page + 1)} />
              </PaginationItem>
            )}
            {page < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href={buildPageUrl(page + 1)}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
