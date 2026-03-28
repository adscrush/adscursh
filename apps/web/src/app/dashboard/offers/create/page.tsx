"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@adscrush/ui/components/card"
import { Label } from "@adscrush/ui/components/label"
import { Input } from "@adscrush/ui/components/input"
import { Textarea } from "@adscrush/ui/components/textarea"
import { Button } from "@adscrush/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { apiPost } from "@/lib/api-client"

export default function CreateOfferPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const form = new FormData(e.currentTarget)
    try {
      const result = await apiPost<{ success: boolean; data: { id: string } }>(
        "/api/offers",
        {
          name: form.get("name"),
          advertiserId: form.get("advertiserId"),
          description: form.get("description") || undefined,
          offerUrl: form.get("offerUrl"),
          previewUrl: form.get("previewUrl") || undefined,
          payoutType: form.get("payoutType") || "CPA",
          defaultPayout: form.get("defaultPayout") || "0",
          defaultRevenue: form.get("defaultRevenue") || "0",
          currency: form.get("currency") || "USD",
          targetGeo: form.get("targetGeo") || undefined,
          status: form.get("status") || "active",
        }
      )
      if (result.data?.id) {
        router.push(`/offers/${result.data.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Offer" description="Set up a new advertising offer" />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Offer Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offer Name *</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Advertiser ID *</Label>
                <Input name="advertiserId" required placeholder="Enter advertiser ID" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offer URL *</Label>
                <Input name="offerUrl" type="url" required />
              </div>
              <div className="space-y-2">
                <Label>Preview URL</Label>
                <Input name="previewUrl" type="url" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Payout Type</Label>
                <Select name="payoutType" defaultValue="CPA">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPA">CPA</SelectItem>
                    <SelectItem value="CPC">CPC</SelectItem>
                    <SelectItem value="CPL">CPL</SelectItem>
                    <SelectItem value="CPS">CPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Revenue</Label>
                <Input name="defaultRevenue" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label>Payout</Label>
                <Input name="defaultPayout" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input name="currency" defaultValue="USD" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Geo</Label>
                <Input name="targetGeo" placeholder="e.g., All Countries" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Offer"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
