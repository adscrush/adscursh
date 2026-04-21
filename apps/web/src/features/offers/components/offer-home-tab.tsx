"use client"

import { Badge } from "@adscrush/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@adscrush/ui/components/card"
import { Separator } from "@adscrush/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adscrush/ui/components/table"
import { IconChevronDown, IconCopy, IconExternalLink, IconInfoCircle, IconWorld } from "@tabler/icons-react"
import { OfferDetail } from "../queries"
import { format } from "date-fns"

interface OfferHomeTabProps {
  offer: OfferDetail
}

export function OfferHomeTab({ offer }: OfferHomeTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column - 2/3 width */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="flex size-24 items-center justify-center rounded-lg border bg-muted/50">
                {offer.logo ? (
                  <img src={offer.logo} alt={offer.name} className="size-full object-contain p-2" />
                ) : (
                  <div className="size-12 bg-muted-foreground/20" />
                )}
              </div>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">{offer.id}</div>
                <h2 className="text-xl font-bold">{offer.name}</h2>
                <Badge variant={offer.status === "active" ? "default" : "secondary"} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                  <div className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />
                  {offer.status === "active" ? "Active" : offer.status}
                </Badge>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-y-4 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">APP ID :</span>
                <span>-</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">External Offer ID :</span>
                <span>-</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Advertiser ID :</span>
                <span className="font-medium text-primary">{offer.advertiser?.name || offer.advertiserId}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Preview URL :</span>
                <span className="truncate">-</span>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <span className="text-muted-foreground">Offer URL :</span>
                <a href={offer.offerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  {offer.offerUrl} <IconExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Offer Category :</span>
                <span>{offer.category?.name || "Uncategorized"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Visibility :</span>
                <span className="capitalize">{offer.visibility}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Schedule :</span>
                <span>
                  {offer.startDate ? format(new Date(offer.startDate), "dd-MMM-yyyy") : "Always"}
                  {offer.endDate ? ` to ${format(new Date(offer.endDate), "dd-MMM-yyyy")}` : ""}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">TargetGeo :</span>
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <IconWorld className="size-4" /> {offer.targetGeo || "All Countries"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Revenue, Payout and Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Advertiser Model :</span>
                <div className="text-sm font-bold">{offer.revenueType}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Advertiser Pricing (Revenue) :</span>
                <div className="text-sm font-bold">{offer.defaultRevenue}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Currency :</span>
                <div className="text-sm font-bold">{offer.currency}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Affiliate Model :</span>
                <div className="text-sm font-bold">{offer.payoutType}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Affiliate Pricing (Payout) :</span>
                <div className="text-sm font-bold">{offer.defaultPayout}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold">Events :</div>
              <div className="text-xs text-muted-foreground">No Events Added</div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">Payout Rules</div>
              <IconChevronDown className="size-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">No Payout Rules Found</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold">Offer Description, Terms/KPI</CardTitle>
            <IconChevronDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-bold">Offer Description :</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {offer.description || "No description provided"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold">Terms/KPI :</div>
              <div className="text-sm text-muted-foreground">
                No KPI provided
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - 1/3 width */}
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconCopy className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold">Affiliate Tracking URL</div>
                <div className="text-xs text-muted-foreground">Share Affiliate Tracking URL</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold">Targeting Rules</CardTitle>
            <IconChevronDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">No Targeting Rules Found</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold">Capping Rules</CardTitle>
            <IconChevronDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">No Capping Rules Found</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold">Landing Pages</CardTitle>
            <IconChevronDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-[10px] uppercase">
                  <TableHead className="h-8 w-10">#</TableHead>
                  <TableHead className="h-8">Name</TableHead>
                  <TableHead className="h-8">Type</TableHead>
                  <TableHead className="h-8">URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offer.landingPages && offer.landingPages.length > 0 ? (
                  offer.landingPages.map((lp, index) => (
                    <TableRow key={lp.id} className="text-[11px]">
                      <TableCell className="py-2">{index + 1}</TableCell>
                      <TableCell className="py-2">{lp.name}</TableCell>
                      <TableCell className="py-2">Landing</TableCell>
                      <TableCell className="max-w-[150px] py-2">
                        <div className="truncate text-primary">{lp.url}</div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No landing pages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Fallback :</span>
              <span className="font-medium">{offer.fallbackUrl ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Anti-Fraud :</span>
                <IconInfoCircle className="size-3" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-muted/30 text-[10px] font-normal">Browser Blank Referral: Allow</Badge>
                <Badge variant="outline" className="bg-muted/30 text-[10px] font-normal">Conversion Speed: 2678400 Sec (Action: Approve)</Badge>
                <Badge variant="outline" className="bg-muted/30 text-[10px] font-normal">Referral Redirect: Allow Referral - 302 Redirect</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
