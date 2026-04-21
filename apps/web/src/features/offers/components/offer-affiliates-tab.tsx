"use client"

import { useAffiliates } from "@/features/affiliates/queries"
import { Badge } from "@adscrush/ui/components/badge"
import { Button } from "@adscrush/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@adscrush/ui/components/card"
import { Input } from "@adscrush/ui/components/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@adscrush/ui/components/pagination"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import { cn } from "@adscrush/ui/lib/utils"
import { IconChartBar, IconRefresh, IconSearch, IconShare, IconUserPlus, IconUsers } from "@tabler/icons-react"
import { useDebouncedValue } from "@tanstack/react-pacer"
import * as React from "react"
import { useAssignOfferAffiliate, useOfferAffiliates, useUpdateOfferAffiliate, type OfferDetail } from "../queries"
import { OfferAffiliateTrackingDialog } from "./offer-affiliate-tracking-dialog"

interface OfferAffiliatesTabProps {
  offer: OfferDetail
}

type ViewMode = "all" | "pending" | "approved" | "rejected" | "assigned"

interface DisplayItem {
  id: string
  affiliateId: string
  affiliateName: string
  affiliateEmail: string
  affiliateCompany?: string | null
  status: string
  oaId?: string
}

export function OfferAffiliatesTab({ offer }: OfferAffiliatesTabProps) {
  const [view, setView] = React.useState<ViewMode>("all")
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")

  const [debouncedSearch, debouncer] = useDebouncedValue(search, { wait: 300 }, (state) => ({
    isPending: state.isPending,
  }))

  const {
    data: allAffiliatesResult,
    isLoading: isAllLoading,
    isFetching: isAllFetching,
  } = useAffiliates({
    page,
    perPage: 10,
    name: debouncedSearch,
    status: [],
    sort: [{ id: "createdAt", desc: true }],
    filters: [],
    joinOperator: "and",
    filterFlag: "commandFilters",
    createdAt: [],
  })

  const {
    data: assignedResult,
    isLoading: isAssignedLoading,
    refetch,
    isFetching: isAssignedFetching,
  } = useOfferAffiliates(offer.id)

  const assignAffiliate = useAssignOfferAffiliate()
  const updateAffiliate = useUpdateOfferAffiliate()

  const assignedAffiliates = assignedResult?.data ?? []

  const stats = React.useMemo(() => {
    return {
      all: allAffiliatesResult?.meta?.total ?? 0,
      pending: assignedAffiliates.filter((a) => a.status === "pending").length,
      approved: assignedAffiliates.filter((a) => a.status === "approved").length,
      rejected: assignedAffiliates.filter((a) => a.status === "rejected").length,
    }
  }, [assignedAffiliates, allAffiliatesResult])

  const isLoading = view === "all" ? isAllLoading : isAssignedLoading
  const isFetching = (view === "all" ? isAllFetching : isAssignedFetching) || debouncer.state.isPending

  const displayList = React.useMemo((): DisplayItem[] => {
    let items: DisplayItem[] = []

    if (view === "all") {
      items = (allAffiliatesResult?.data ?? []).map((aff) => {
        const assigned = assignedAffiliates.find((a) => a.affiliateId === aff.id)
        return {
          id: aff.id,
          affiliateId: aff.id,
          affiliateName: aff.name,
          affiliateEmail: aff.email,
          affiliateCompany: aff.companyName,
          status: assigned?.status ?? "not_assigned",
          oaId: assigned?.id,
        }
      })
    } else {
      let filtered = assignedAffiliates
      if (view === "pending") filtered = assignedAffiliates.filter((a) => a.status === "pending")
      if (view === "approved") filtered = assignedAffiliates.filter((a) => a.status === "approved")
      if (view === "rejected") filtered = assignedAffiliates.filter((a) => a.status === "rejected")

      items = filtered.map((a) => ({
        id: a.id,
        affiliateId: a.affiliateId,
        affiliateName: a.affiliateName || "",
        affiliateEmail: a.affiliateEmail || "",
        affiliateCompany: a.affiliateCompanyName,
        status: a.status,
        oaId: a.id,
      }))
    }

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase()
      return items.filter(
        (a) =>
          a.affiliateName?.toLowerCase().includes(s) ||
          a.affiliateEmail?.toLowerCase().includes(s) ||
          a.affiliateCompany?.toLowerCase().includes(s) ||
          a.affiliateId?.toLowerCase().includes(s)
      )
    }

    return items
  }, [view, allAffiliatesResult, assignedAffiliates, debouncedSearch])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IconUsers className="size-5" /> Manage Affiliates
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className={isFetching ? "animate-spin" : ""}
                >
                  <IconRefresh className="size-4" />
                </Button>
              </CardTitle>
            </div>
            <div className="relative w-64">
              <IconSearch className="absolute top-2.5 left-2 size-3 text-muted-foreground" />
              <Input
                placeholder="Search affiliates..."
                className="h-7 pl-8 text-xs"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
              {isFetching && (
                <div className="absolute top-2 right-2 flex size-3 items-center justify-center">
                  <div className="size-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {view === "all" ? "All Affiliates" : `${view} Affiliates`.toUpperCase()}
              </h4>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : displayList.length === 0 ? (
              <div className="mt-4 rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
                No affiliates found for this view.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y overflow-hidden rounded-md border">
                  {displayList.map((item) => (
                    <AffiliateRow
                      key={item.id}
                      item={item}
                      offer={offer}
                      onAssign={() =>
                        assignAffiliate.mutateAsync({
                          id: offer.id,
                          data: { affiliateId: item.affiliateId, status: "approved" },
                        })
                      }
                      onUpdate={(data) =>
                        updateAffiliate.mutateAsync({
                          offerId: offer.id,
                          oaId: item.oaId || item.id,
                          data,
                        })
                      }
                    />
                  ))}
                </div>

                {view === "all" && allAffiliatesResult?.meta && allAffiliatesResult.meta.totalPages > 1 && (
                  <div className="pt-4">
                    <PaginationComponent
                      currentPage={page}
                      totalPages={allAffiliatesResult.meta.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <IconShare className="size-4 text-primary" /> Affiliate Tracking URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Quickly access tracking link for any approved affiliate by clicking the share button in the list.
            </p>
            <Button
              variant="outline"
              className="h-8 w-full gap-2 text-[10px] font-bold tracking-tight uppercase"
              disabled={stats.approved === 0}
              onClick={() => setView("approved")}
            >
              <IconShare className="size-3.5" /> Share URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <IconChartBar className="size-4" /> Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-[11px]">
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between p-3 px-4 transition-colors hover:bg-muted/50",
                  view === "all" && "bg-muted/50"
                )}
                onClick={() => setView("all")}
              >
                <span className="font-semibold text-muted-foreground uppercase">All Affiliates</span>
                <Badge variant="secondary" className="h-5 min-w-5 justify-center">
                  {stats.all}
                </Badge>
              </div>
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between p-3 px-4 transition-colors hover:bg-muted/50",
                  view === "assigned" && "bg-primary/5"
                )}
                onClick={() => setView("assigned")}
              >
                <span className="text-[10px] font-semibold text-primary uppercase">Assigned</span>
                <Badge variant="outline" className="h-5 min-w-5 justify-center border-primary/20 text-primary">
                  {stats.pending + stats.approved + stats.rejected}
                </Badge>
              </div>
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between p-3 px-4 transition-colors hover:bg-muted/50",
                  view === "pending" && "bg-yellow-50/50"
                )}
                onClick={() => setView("pending")}
              >
                <span className="font-semibold text-yellow-600 uppercase">Pending</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-yellow-200 bg-yellow-50/50 text-yellow-600"
                >
                  {stats.pending}
                </Badge>
              </div>
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between p-3 px-4 transition-colors hover:bg-muted/50",
                  view === "approved" && "bg-green-50/50"
                )}
                onClick={() => setView("approved")}
              >
                <span className="font-semibold text-green-600 uppercase">Approved</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-green-200 bg-green-50/50 text-green-600"
                >
                  {stats.approved}
                </Badge>
              </div>
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between p-3 px-4 transition-colors hover:bg-muted/50",
                  view === "rejected" && "bg-red-50/50"
                )}
                onClick={() => setView("rejected")}
              >
                <span className="font-semibold text-red-600 uppercase">Rejected</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-red-200 bg-red-50/50 text-red-600"
                >
                  {stats.rejected}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  const pages = React.useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  }, [currentPage, totalPages])

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) onPageChange(currentPage - 1)
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === currentPage}
              onClick={(e) => {
                e.preventDefault()
                onPageChange(p)
              }}
              className="cursor-pointer"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {totalPages > 5 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(totalPages)
                }}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) onPageChange(currentPage + 1)
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function AffiliateRow({
  item,
  offer,
  onAssign,
  onUpdate,
}: {
  item: DisplayItem
  offer: OfferDetail
  onAssign?: () => Promise<unknown>
  onUpdate: (data: { status: "approved" | "rejected" | "pending" }) => Promise<unknown>
}) {
  return (
    <div className="flex items-center justify-between bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary shadow-sm">
          {item.affiliateName
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold">{item.affiliateName}</p>
            {item.affiliateCompany && (
              <span className="text-[10px] text-muted-foreground">({item.affiliateCompany})</span>
            )}
            <span className="rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
              ID: {item.affiliateId}
            </span>
          </div>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">{item.affiliateEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.status === "not_assigned" ? (
          <Button
            variant="default"
            size="xs"
            className="h-7 gap-1.5 px-3 text-[10px] font-bold shadow-sm"
            onClick={onAssign}
          >
            <IconUserPlus className="size-3" /> Assign Offer
          </Button>
        ) : (
          <>
            {item.status !== "approved" && (
              <Button
                variant="default"
                size="xs"
                className="h-7 bg-green-600 px-3 text-[10px] font-bold text-white hover:bg-green-700"
                onClick={() => onUpdate({ status: "approved" })}
              >
                Approve
              </Button>
            )}
            {item.status !== "rejected" && (
              <Button
                variant="destructive"
                size="xs"
                className="h-7 px-3 text-[10px] font-bold"
                onClick={() => onUpdate({ status: "rejected" })}
              >
                Reject
              </Button>
            )}
            {item.status === "approved" && (
              <OfferAffiliateTrackingDialog offer={offer} affiliate={item}>
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 gap-1.5 border-primary/20 px-3 text-[10px] font-semibold"
                >
                  <IconShare className="size-3" /> Share
                </Button>
              </OfferAffiliateTrackingDialog>
            )}
          </>
        )}
      </div>
    </div>
  )
}
