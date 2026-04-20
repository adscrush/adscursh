"use client"

import * as React from "react"
import {
  useOfferAffiliates,
  useAssignOfferAffiliate,
  useUpdateOfferAffiliate,
  Offer,
} from "../queries"
import { useAffiliateSearch } from "@/features/search/queries"
import { useAffiliates } from "@/features/affiliates/queries"
import { Button } from "@adscrush/ui/components/button"
import { Input } from "@adscrush/ui/components/input"
import {
  IconUsers,
  IconRefresh,
  IconSearch,
  IconCircleCheck,
  IconCircleX,
  IconShare,
  IconChartBar,
  IconClock,
  IconUserPlus,
} from "@tabler/icons-react"
import { Badge } from "@adscrush/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@adscrush/ui/components/card"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import { OfferAffiliateTrackingDialog } from "./offer-affiliate-tracking-dialog"
import { useDebouncedValue } from "@tanstack/react-pacer"
import { cn } from "@adscrush/ui/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@adscrush/ui/components/pagination"

interface OfferAffiliatesTabProps {
  offer: Offer
}

type ViewMode = "all" | "pending" | "approved" | "rejected" | "assigned"

export function OfferAffiliatesTab({ offer }: OfferAffiliatesTabProps) {
  const [view, setView] = React.useState<ViewMode>("all")
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  
  const [debouncedSearch, debouncer] = useDebouncedValue(
    search,
    { wait: 300 },
    (state) => ({ isPending: state.isPending })
  )

  // Fetch all affiliates (system-wide) for the "All" view
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
  } as any)

  // Fetch only assigned affiliates for this offer
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
      pending: assignedAffiliates.filter((a: any) => a.status === "pending").length,
      approved: assignedAffiliates.filter((a: any) => a.status === "approved").length,
      rejected: assignedAffiliates.filter((a: any) => a.status === "rejected").length,
    }
  }, [assignedAffiliates, allAffiliatesResult])

  const isLoading = view === "all" ? isAllLoading : isAssignedLoading
  const isFetching = (view === "all" ? isAllFetching : isAssignedFetching) || debouncer.state.isPending

  const displayList = React.useMemo(() => {
    if (view === "all") {
      return (allAffiliatesResult?.data ?? []).map((aff: any) => {
        const assigned = assignedAffiliates.find((a: any) => a.affiliateId === aff.id)
        return {
          ...aff,
          affiliateName: aff.name,
          affiliateEmail: aff.email,
          status: assigned?.status ?? "not_assigned",
          oaId: assigned?.id
        }
      })
    }
    
    let filtered = assignedAffiliates
    if (view === "pending") filtered = assignedAffiliates.filter((a: any) => a.status === "pending")
    if (view === "approved") filtered = assignedAffiliates.filter((a: any) => a.status === "approved")
    if (view === "rejected") filtered = assignedAffiliates.filter((a: any) => a.status === "rejected")

    if (debouncedSearch) {
      filtered = filtered.filter((a: any) => 
        a.affiliateName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.affiliateEmail?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    }
    return filtered
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
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
               <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                  {displayList.map((item: any) => (
                    <AffiliateRow
                      key={item.id}
                      item={item}
                      offer={offer}
                      onAssign={() => assignAffiliate.mutateAsync({ id: offer.id, data: { affiliateId: item.id, status: "approved" } })}
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

      {/* Right Sidebar Stats */}
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <IconShare className="size-4 text-primary" /> Affiliate Tracking URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Quickly access tracking link for any approved affiliate by clicking the share button in the list.
            </p>
            <Button
              variant="outline"
              className="h-8 w-full gap-2 text-[10px] font-bold uppercase tracking-tight"
              disabled={stats.approved === 0}
              onClick={() => setView("approved")}
            >
              <IconShare className="size-3.5" /> Share URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <IconChartBar className="size-4" /> Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-[11px]">
              <div 
                className={cn(
                    "flex items-center justify-between p-3 px-4 transition-colors cursor-pointer hover:bg-muted/50",
                    view === "all" && "bg-muted/50"
                )}
                onClick={() => setView("all")}
              >
                <span className="font-semibold text-muted-foreground uppercase">All Affiliates</span>
                <Badge variant="secondary" className="h-5 min-w-5 justify-center">{stats.all}</Badge>
              </div>
              <div 
                className={cn(
                    "flex items-center justify-between p-3 px-4 transition-colors cursor-pointer hover:bg-muted/50",
                    view === "assigned" && "bg-primary/5"
                )}
                onClick={() => setView("assigned")}
              >
                <span className="font-semibold text-primary uppercase text-[10px]">Assigned</span>
                <Badge variant="outline" className="h-5 min-w-5 justify-center border-primary/20 text-primary">{stats.pending + stats.approved + stats.rejected}</Badge>
              </div>
              <div 
                className={cn(
                    "flex items-center justify-between p-3 px-4 transition-colors cursor-pointer hover:bg-muted/50",
                    view === "pending" && "bg-yellow-50/50"
                )}
                onClick={() => setView("pending")}
              >
                <span className="font-semibold text-yellow-600 uppercase">Pending</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-yellow-200 text-yellow-600 bg-yellow-50/50"
                >
                  {stats.pending}
                </Badge>
              </div>
              <div 
                className={cn(
                    "flex items-center justify-between p-3 px-4 transition-colors cursor-pointer hover:bg-muted/50",
                    view === "approved" && "bg-green-50/50"
                )}
                onClick={() => setView("approved")}
              >
                <span className="font-semibold text-green-600 uppercase">Approved</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-green-200 text-green-600 bg-green-50/50"
                >
                  {stats.approved}
                </Badge>
              </div>
              <div 
                className={cn(
                    "flex items-center justify-between p-3 px-4 transition-colors cursor-pointer hover:bg-muted/50",
                    view === "rejected" && "bg-red-50/50"
                )}
                onClick={() => setView("rejected")}
              >
                <span className="font-semibold text-red-600 uppercase">Rejected</span>
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-red-200 text-red-600 bg-red-50/50"
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

function PaginationComponent({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) {
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1)
    
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1) }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
                
                {pages.map(p => (
                    <PaginationItem key={p}>
                        <PaginationLink 
                            href="#" 
                            isActive={p === currentPage}
                            onClick={(e) => { e.preventDefault(); onPageChange(p) }}
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
                                onClick={(e) => { e.preventDefault(); onPageChange(totalPages) }}
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
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1) }}
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
  item: any
  offer: Offer
  onAssign?: () => Promise<any>
  onUpdate: (data: any) => Promise<any>
}) {
  return (
    <div className="flex items-center justify-between bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary shadow-sm border border-primary/20">
          {item.affiliateName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold">{item.affiliateName}</p>
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded">ID: {item.affiliateId || item.id}</span>
          </div>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            {item.affiliateEmail}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.status === "not_assigned" ? (
          <Button
            variant="outline"
            size="xs"
            className="h-7 border-primary/30 text-[10px] font-bold text-primary hover:bg-primary/5 gap-1.5 px-3"
            onClick={onAssign}
          >
            <IconUserPlus className="size-3" /> Assign Offer
          </Button>
        ) : (
          <>
            {item.status !== "approved" && (
              <Button
                variant="outline"
                size="xs"
                className="h-7 border-green-200 text-[10px] font-semibold text-green-600 hover:bg-green-50 px-3"
                onClick={() => onUpdate({ status: "approved" })}
              >
                Approve
              </Button>
            )}
            {item.status !== "rejected" && (
              <Button
                variant="outline"
                size="xs"
                className="h-7 border-red-200 text-[10px] font-semibold text-red-600 hover:bg-red-50 px-3"
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
                  className="h-7 gap-1.5 text-[10px] font-semibold border-primary/20 px-3"
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
