"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@adscrush/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@adscrush/ui/components/tabs"
import { Label } from "@adscrush/ui/components/label"
import { Input } from "@adscrush/ui/components/input"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { IconPlus, IconCopy, IconTrash } from "@tabler/icons-react"

interface OfferDetail {
  id: string
  name: string
  advertiserId: string
  description: string | null
  offerUrl: string
  previewUrl: string | null
  status: string
  payoutType: string
  defaultPayout: string
  defaultRevenue: string
  currency: string
  targetGeo: string | null
  fallbackUrl: string | null
  allowMultiConversion: boolean
  landingPages: LandingPage[]
  affiliateCount: number
}

interface LandingPage {
  id: string
  name: string
  url: string
  weight: number
  status: string
}

interface OfferAffiliate {
  id: string
  affiliateId: string
  affiliateName: string
  affiliateEmail: string
  status: string
  customPayout: string | null
  customRevenue: string | null
}

const lpColumns: ColumnDef<LandingPage>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "url", header: "URL" },
  { accessorKey: "weight", header: "Weight" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
]

const affColumns: ColumnDef<OfferAffiliate>[] = [
  { accessorKey: "affiliateName", header: "Affiliate" },
  { accessorKey: "affiliateEmail", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  { accessorKey: "customPayout", header: "Custom Payout" },
]

export default function OfferDetailPage() {
  const params = useParams()
  const [offer, setOffer] = useState<OfferDetail | null>(null)
  const [affiliates, setAffiliates] = useState<OfferAffiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lpDialogOpen, setLpDialogOpen] = useState(false)
  const [affDialogOpen, setAffDialogOpen] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState("")

  const fetchOffer = useCallback(() => {
    apiGet<{ data: OfferDetail }>(`/api/offers/${params.id}`)
      .then((res) => setOffer(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const fetchAffiliates = useCallback(() => {
    apiGet<{ data: OfferAffiliate[] }>(`/api/offers/${params.id}/affiliates`)
      .then((res) => setAffiliates(res.data))
      .catch(() => {})
  }, [params.id])

  useEffect(() => {
    fetchOffer()
    fetchAffiliates()
  }, [fetchOffer, fetchAffiliates])

  const handleSave = async () => {
    if (!offer) return
    setSaving(true)
    try {
      await apiPut(`/api/offers/${params.id}`, {
        name: offer.name,
        status: offer.status,
        defaultPayout: offer.defaultPayout,
        defaultRevenue: offer.defaultRevenue,
        offerUrl: offer.offerUrl,
        targetGeo: offer.targetGeo,
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const handleAddLandingPage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await apiPost(`/api/offers/${params.id}/landing-pages`, {
        name: form.get("name"),
        url: form.get("url"),
        weight: Number(form.get("weight")) || 1,
        status: "active",
      })
      setLpDialogOpen(false)
      fetchOffer()
    } catch {
      // error
    }
  }

  const handleDeleteLp = async (lpId: string) => {
    await apiDelete(`/api/offers/${params.id}/landing-pages/${lpId}`)
    fetchOffer()
  }

  const handleAssignAffiliate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await apiPost(`/api/offers/${params.id}/affiliates`, {
        affiliateId: form.get("affiliateId"),
        status: form.get("status") || "pending",
        customPayout: form.get("customPayout") || undefined,
      })
      setAffDialogOpen(false)
      fetchAffiliates()
    } catch {
      // error
    }
  }

  const handleApproveAffiliate = async (oaId: string) => {
    await apiPut(`/api/offers/${params.id}/affiliates/${oaId}`, {
      status: "approved",
    })
    fetchAffiliates()
  }

  const generateTrackingUrl = async (affiliateId: string) => {
    const res = await apiGet<{ data: { url: string } }>(
      `/api/offers/${params.id}/tracking-url`,
      { affiliateId }
    )
    setTrackingUrl(res.data.url)
  }

  if (loading) return <div className="text-muted-foreground text-sm p-6">Loading...</div>
  if (!offer) return <div className="text-muted-foreground text-sm p-6">Offer not found</div>

  const lpColumnsWithActions: ColumnDef<LandingPage>[] = [
    ...lpColumns,
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteLp(row.original.id)}
        >
          <IconTrash className="size-4" />
        </Button>
      ),
    },
  ]

  const affColumnsWithActions: ColumnDef<OfferAffiliate>[] = [
    ...affColumns,
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status !== "approved" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApproveAffiliate(row.original.id)}
            >
              Approve
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateTrackingUrl(row.original.affiliateId)}
          >
            URL
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={offer.name}
        description={`Offer #${offer.id.slice(0, 8)}`}
      >
        <StatusBadge status={offer.status} />
      </PageHeader>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing-pages">
            Landing Pages ({offer.landingPages.length})
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            Affiliates ({affiliates.length})
          </TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Offer Name</Label>
                  <Input
                    value={offer.name}
                    onChange={(e) => setOffer({ ...offer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={offer.status}
                    onValueChange={(v) => setOffer({ ...offer, status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Offer URL</Label>
                <Input
                  value={offer.offerUrl}
                  onChange={(e) => setOffer({ ...offer, offerUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Payout Type</Label>
                  <Input value={offer.payoutType} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Revenue</Label>
                  <Input
                    value={offer.defaultRevenue}
                    onChange={(e) =>
                      setOffer({ ...offer, defaultRevenue: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payout</Label>
                  <Input
                    value={offer.defaultPayout}
                    onChange={(e) =>
                      setOffer({ ...offer, defaultPayout: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Geo</Label>
                <Input
                  value={offer.targetGeo ?? ""}
                  onChange={(e) => setOffer({ ...offer, targetGeo: e.target.value })}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing-pages" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={lpDialogOpen} onOpenChange={setLpDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="mr-1 size-4" /> Add Landing Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Landing Page</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLandingPage} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input name="url" type="url" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input name="weight" type="number" defaultValue="1" min="1" />
                  </div>
                  <Button type="submit" className="w-full">Add</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable columns={lpColumnsWithActions} data={offer.landingPages} />
        </TabsContent>

        <TabsContent value="affiliates" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={affDialogOpen} onOpenChange={setAffDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="mr-1 size-4" /> Assign Affiliate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Affiliate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignAffiliate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Affiliate ID</Label>
                    <Input name="affiliateId" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select name="status" defaultValue="approved">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Payout (optional)</Label>
                    <Input name="customPayout" />
                  </div>
                  <Button type="submit" className="w-full">Assign</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {trackingUrl && (
            <Card>
              <CardContent className="flex items-center gap-2 pt-6">
                <Input value={trackingUrl} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(trackingUrl)}
                >
                  <IconCopy className="size-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <DataTable columns={affColumnsWithActions} data={affiliates} />
        </TabsContent>

        <TabsContent value="integration" className="mt-4">
          <Card>
            <CardHeader><CardTitle>SDK Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>HTML/JavaScript Code</Label>
                <pre className="bg-muted rounded-md p-4 text-xs overflow-x-auto">
{`<script src="https://cdn.adscrush.com/sdk.min.js"></script>
<script>
  AdscrushSDK.init({
    domain: "${process.env.NEXT_PUBLIC_CONVERSION_URL ?? "http://localhost:3003"}"
  });
  
  // Call on conversion event (e.g., purchase, signup)
  AdscrushSDK.trackConversion({
    event: "conversion",
    payout: "0.00"
  });
</script>`}
                </pre>
              </div>
              <div className="space-y-2">
                <Label>Pixel URL</Label>
                <Input
                  readOnly
                  value={`${process.env.NEXT_PUBLIC_CONVERSION_URL ?? "http://localhost:3003"}/conversion/pixel?click_id=CLICK_ID`}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
