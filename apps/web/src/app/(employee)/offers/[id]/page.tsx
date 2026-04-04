"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
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
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@adscrush/ui/components/field"
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react"

interface Offer {
  id: string
  name: string
  description: string | null
  offerUrl: string
  previewUrl: string | null
  status: "active" | "inactive" | "paused" | "expired"
  payoutType: "CPA" | "CPC" | "CPL" | "CPS"
  defaultPayout: string
  defaultRevenue: string
  currency: string
  targetGeo: string | null
  fallbackUrl: string | null
  allowMultiConversion: boolean
  advertiserId: string
  advertiser?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function OfferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offerUrl: "",
    previewUrl: "",
    status: "active" as "active" | "inactive" | "paused" | "expired",
    payoutType: "CPA" as "CPA" | "CPC" | "CPL" | "CPS",
    defaultPayout: "0",
    defaultRevenue: "0",
    currency: "USD",
    targetGeo: "",
    fallbackUrl: "",
    allowMultiConversion: false,
  })

  useEffect(() => {
    async function fetchOffer() {
      try {
        const response = await api.offers[resolvedParams.id].get()
        if (response.data?.success && response.data.data) {
          const data = response.data.data
          setOffer(data)
          setFormData({
            name: data.name || "",
            description: data.description || "",
            offerUrl: data.offerUrl || "",
            previewUrl: data.previewUrl || "",
            status: data.status || "active",
            payoutType: data.payoutType || "CPA",
            defaultPayout: data.defaultPayout || "0",
            defaultRevenue: data.defaultRevenue || "0",
            currency: data.currency || "USD",
            targetGeo: data.targetGeo || "",
            fallbackUrl: data.fallbackUrl || "",
            allowMultiConversion: data.allowMultiConversion || false,
          })
        }
      } catch (err) {
        console.error("Failed to fetch offer:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOffer()
  }, [resolvedParams.id])

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const payload = {
        ...formData,
        defaultPayout: formData.defaultPayout || "0",
        defaultRevenue: formData.defaultRevenue || "0",
      }

      const response = await api.offers[resolvedParams.id].put(payload as never)
      if (response.data?.success && response.data.data) {
        setOffer(response.data.data)
        setIsEditing(false)
      } else {
        setError(response.data?.error || "Failed to update offer")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update offer")
    } finally {
      setSaving(false)
    }
  }

  const fetchTrackingUrl = async () => {
    try {
      const response = await api.offers[resolvedParams.id]["tracking-url"].get()
      if (response.data?.success && response.data.data) {
        setTrackingUrl(response.data.data.url)
      }
    } catch (err) {
      console.error("Failed to fetch tracking URL:", err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Offer Details" description="Loading..." />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Offer Not Found"
          description="The offer could not be found"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={offer.name}
        description="View and manage offer details"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/offers">Back</Link>
          </Button>
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className="mr-2 size-4" />
              Edit
            </Button>
          )}
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Offer Information</h3>
            <Field>
              <FieldGroup>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as typeof formData.status,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        offer.status === "active"
                          ? "default"
                          : offer.status === "paused"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {offer.status}
                    </Badge>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Advertiser</FieldLabel>
                  <p className="text-sm">
                    {offer.advertiser?.name || offer.advertiserId}
                  </p>
                </Field>

                <Field>
                  <FieldLabel>Offer URL</FieldLabel>
                  {isEditing ? (
                    <Input
                      value={formData.offerUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, offerUrl: e.target.value })
                      }
                    />
                  ) : (
                    <a
                      href={offer.offerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {offer.offerUrl}
                      <IconExternalLink className="size-3" />
                    </a>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Preview URL</FieldLabel>
                  {isEditing ? (
                    <Input
                      value={formData.previewUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, previewUrl: e.target.value })
                      }
                    />
                  ) : offer.previewUrl ? (
                    <a
                      href={offer.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {offer.previewUrl}
                      <IconExternalLink className="size-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not set</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  {isEditing ? (
                    <Input
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {offer.description || "Not set"}
                    </p>
                  )}
                </Field>
              </FieldGroup>
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Payout & Revenue</h3>
            <Field>
              <FieldGroup>
                <Field>
                  <FieldLabel>Payout Type</FieldLabel>
                  {isEditing ? (
                    <Select
                      value={formData.payoutType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          payoutType: value as typeof formData.payoutType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPA">CPA</SelectItem>
                        <SelectItem value="CPC">CPC</SelectItem>
                        <SelectItem value="CPL">CPL</SelectItem>
                        <SelectItem value="CPS">CPS</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{offer.payoutType}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Default Payout</FieldLabel>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.defaultPayout}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultPayout: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {offer.currency} {offer.defaultPayout}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Default Revenue</FieldLabel>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.defaultRevenue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultRevenue: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {offer.currency} {offer.defaultRevenue}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Target Geo</FieldLabel>
                  {isEditing ? (
                    <Input
                      value={formData.targetGeo}
                      onChange={(e) =>
                        setFormData({ ...formData, targetGeo: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{offer.targetGeo || "Not set"}</p>
                  )}
                </Field>
              </FieldGroup>
            </Field>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/offers/${resolvedParams.id}/landing-pages`}>
                  <IconPlus className="mr-2 size-4" />
                  Manage Landing Pages
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={fetchTrackingUrl}
              >
                <IconExternalLink className="mr-2 size-4" />
                Generate Tracking URL
              </Button>
              {trackingUrl && (
                <div className="mt-2 rounded bg-muted p-2 text-xs break-all">
                  {trackingUrl}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
