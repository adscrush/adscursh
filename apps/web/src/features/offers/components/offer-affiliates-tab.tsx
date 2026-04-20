"use client"

import * as React from "react"
import {
  useOfferAffiliates,
  useAssignOfferAffiliate,
  useUpdateOfferAffiliate,
  Offer,
} from "../queries"
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
import { AssignAffiliateDialog } from "./assign-affiliate-dialog"

interface OfferAffiliatesTabProps {
  offer: Offer
}

export function OfferAffiliatesTab({ offer }: OfferAffiliatesTabProps) {
  const {
    data: affiliates,
    isLoading,
    refetch,
    isFetching,
  } = useOfferAffiliates(offer.id)
  const updateAffiliate = useUpdateOfferAffiliate()
  const [search, setSearch] = React.useState("")

  const stats = React.useMemo(() => {
    if (!affiliates?.data)
      return { all: 0, pending: 0, approved: 0, rejected: 0 }
    return {
      all: affiliates.data.length,
      pending: affiliates.data.filter((a: any) => a.status === "pending")
        .length,
      approved: affiliates.data.filter((a: any) => a.status === "approved")
        .length,
      rejected: affiliates.data.filter((a: any) => a.status === "rejected")
        .length,
    }
  }, [affiliates])

  const filteredAffiliates = React.useMemo(() => {
    if (!affiliates?.data) return []
    return affiliates.data.filter(
      (a: any) =>
        a.affiliateName?.toLowerCase().includes(search.toLowerCase()) ||
        a.affiliateEmail?.toLowerCase().includes(search.toLowerCase())
    )
  }, [affiliates, search])

  const approved = filteredAffiliates.filter(
    (a: any) => a.status === "approved"
  )
  const pending = filteredAffiliates.filter((a: any) => a.status === "pending")
  const rejected = filteredAffiliates.filter(
    (a: any) => a.status === "rejected"
  )

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
                  disabled={isLoading || isFetching}
                  className={isFetching ? "animate-spin" : ""}
                >
                  <IconRefresh className="size-4" />
                </Button>
              </CardTitle>
              {/* <AssignAffiliateDialog offerId={offer.id} /> */}
            </div>
            <div className="relative w-64">
              <IconSearch className="absolute top-2.5 left-2 size-3 text-muted-foreground" />
              <Input
                placeholder="Search assigned affiliates..."
                className="h-6 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredAffiliates.length === 0 ? (
              <div className="mt-4 rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
                No affiliates found matching your search.
              </div>
            ) : (
              <div className="space-y-8 pt-4">
                {/* Approved Section */}
                {approved.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-green-600">
                      <IconCircleCheck className="size-4" /> Approved
                    </h4>
                    <div className="divide-y overflow-hidden rounded-md border">
                      {approved.map((a: any) => (
                        <AffiliateRow
                          key={a.id}
                          item={a}
                          offer={offer}
                          onUpdate={(data) =>
                            updateAffiliate.mutateAsync({
                              offerId: offer.id,
                              oaId: a.id,
                              data,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Section */}
                {pending.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-600">
                      <IconClock className="size-4" /> Pending
                    </h4>
                    <div className="divide-y overflow-hidden rounded-md border">
                      {pending.map((a: any) => (
                        <AffiliateRow
                          key={a.id}
                          item={a}
                          offer={offer}
                          onUpdate={(data) =>
                            updateAffiliate.mutateAsync({
                              offerId: offer.id,
                              oaId: a.id,
                              data,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Section */}
                {rejected.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-red-600">
                      <IconCircleX className="size-4" /> Rejected
                    </h4>
                    <div className="divide-y overflow-hidden rounded-md border">
                      {rejected.map((a: any) => (
                        <AffiliateRow
                          key={a.id}
                          item={a}
                          offer={offer}
                          onUpdate={(data) =>
                            updateAffiliate.mutateAsync({
                              offerId: offer.id,
                              oaId: a.id,
                              data,
                            })
                          }
                        />
                      ))}
                    </div>
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
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <IconShare className="size-4 text-primary" /> Affiliate Tracking
              URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Quickly access tracking link for any approved affiliate.
            </p>
            <Button
              variant="outline"
              className="h-9 w-full gap-2"
              disabled={stats.approved === 0}
            >
              <IconShare className="size-4" /> Share URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <IconChartBar className="size-4" /> Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              <div className="flex items-center justify-between p-3 px-4">
                <span className="font-medium">ALL AFFILIATES</span>
                <Badge variant="secondary">{stats.all}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 px-4">
                <span className="font-medium text-yellow-600">PENDING</span>
                <Badge
                  variant="outline"
                  className="border-yellow-200 text-yellow-600"
                >
                  {stats.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 px-4">
                <span className="font-medium text-green-600">APPROVED</span>
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-600"
                >
                  {stats.approved}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 px-4">
                <span className="font-medium text-red-600">REJECTED</span>
                <Badge
                  variant="outline"
                  className="border-red-200 text-red-600"
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

function AffiliateRow({
  item,
  offer,
  onUpdate,
}: {
  item: any
  offer: Offer
  onUpdate: (data: any) => Promise<any>
}) {
  return (
    <div className="flex items-center justify-between bg-card p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {item.affiliateName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold">{item.affiliateName}</p>
          <p className="text-[10px] text-muted-foreground">
            {item.affiliateEmail}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.status !== "approved" && (
          <Button
            variant="outline"
            size="xs"
            className="h-7 border-green-200 text-[10px] text-green-600 hover:bg-green-50"
            onClick={() => onUpdate({ status: "approved" })}
          >
            Approve
          </Button>
        )}
        {item.status !== "rejected" && (
          <Button
            variant="outline"
            size="xs"
            className="h-7 border-red-200 text-[10px] text-red-600 hover:bg-red-50"
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
              className="h-7 gap-1.5 text-[10px]"
            >
              <IconShare className="size-3" /> Share
            </Button>
          </OfferAffiliateTrackingDialog>
        )}
      </div>
    </div>
  )
}
