"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@adscrush/ui/components/field"
import { IconArrowLeft, IconPlus } from "@tabler/icons-react"

interface Advertiser {
  id: string
  name: string
  companyName: string | null
}

export default function NewOfferPage() {
  const router = useRouter()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    advertiserId: "",
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
    async function fetchAdvertisers() {
      try {
        const response = await api.advertisers.get("limit=100")
        if (response.data?.success && response.data.data) {
          setAdvertisers(response.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch advertisers:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAdvertisers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const payload = {
        ...formData,
        defaultPayout: formData.defaultPayout || "0",
        defaultRevenue: formData.defaultRevenue || "0",
      }

      const response = await api.offers.post(payload as never)
      if (response.data?.success && response.data.data) {
        router.push(`/offers/${response.data.data.id}`)
      } else {
        setError(response.data?.error || "Failed to create offer")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create Offer" description="Loading..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Offer"
        description="Create a new offer to track conversions"
      >
        <Link href="/offers">
          <Button variant="outline">
            <IconArrowLeft className="mr-2 size-4" />
            Back to Offers
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field>
          <FieldGroup>
            <Field>
              <FieldLabel>Offer Name *</FieldLabel>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter offer name"
              />
            </Field>

            <Field>
              <FieldLabel>Advertiser *</FieldLabel>
              <Select
                value={formData.advertiserId}
                onValueChange={(value) =>
                  setFormData({ ...formData, advertiserId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select advertiser" />
                </SelectTrigger>
                <SelectContent>
                  {advertisers.map((adv) => (
                    <SelectItem key={adv.id} value={adv.id}>
                      {adv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Offer URL *</FieldLabel>
              <Input
                required
                type="url"
                value={formData.offerUrl}
                onChange={(e) =>
                  setFormData({ ...formData, offerUrl: e.target.value })
                }
                placeholder="https://example.com/offer"
              />
              <FieldDescription>
                The URL where conversions will be tracked
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Preview URL</FieldLabel>
              <Input
                type="url"
                value={formData.previewUrl}
                onChange={(e) =>
                  setFormData({ ...formData, previewUrl: e.target.value })
                }
                placeholder="https://example.com/preview"
              />
            </Field>

            <Field>
              <FieldLabel>Status</FieldLabel>
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
            </Field>

            <Field>
              <FieldLabel>Payout Type</FieldLabel>
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
            </Field>

            <Field>
              <FieldLabel>Default Payout</FieldLabel>
              <Input
                type="number"
                step="0.01"
                value={formData.defaultPayout}
                onChange={(e) =>
                  setFormData({ ...formData, defaultPayout: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>

            <Field>
              <FieldLabel>Default Revenue</FieldLabel>
              <Input
                type="number"
                step="0.01"
                value={formData.defaultRevenue}
                onChange={(e) =>
                  setFormData({ ...formData, defaultRevenue: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>

            <Field>
              <FieldLabel>Currency</FieldLabel>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Target Geo</FieldLabel>
              <Input
                value={formData.targetGeo}
                onChange={(e) =>
                  setFormData({ ...formData, targetGeo: e.target.value })
                }
                placeholder="e.g., US, CA, UK"
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </Field>
          </FieldGroup>
        </Field>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Offer"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/offers">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
