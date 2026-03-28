"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@adscrush/ui/components/card"
import { Label } from "@adscrush/ui/components/label"
import { Input } from "@adscrush/ui/components/input"
import { Button } from "@adscrush/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { apiGet, apiPut } from "@/lib/api-client"

interface AffiliateDetail {
  id: string
  name: string
  companyName: string | null
  email: string
  status: string
  createdAt: string
}

export default function AffiliateDetailPage() {
  const params = useParams()
  const [affiliate, setAffiliate] = useState<AffiliateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    status: "active",
  })

  useEffect(() => {
    apiGet<{ data: AffiliateDetail }>(`/api/affiliates/${params.id}`)
      .then((res) => {
        setAffiliate(res.data)
        setForm({
          name: res.data.name,
          companyName: res.data.companyName ?? "",
          email: res.data.email,
          status: res.data.status,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPut(`/api/affiliates/${params.id}`, {
        name: form.name,
        companyName: form.companyName || undefined,
        email: form.email,
        status: form.status,
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-6">Loading...</div>
  if (!affiliate) return <div className="text-muted-foreground text-sm p-6">Not found</div>

  return (
    <div className="space-y-6">
      <PageHeader title={affiliate.name} description={`Affiliate #${affiliate.id.slice(0, 8)}`}>
        <StatusBadge status={affiliate.status} />
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Affiliate Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
