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
import { Field, FieldLabel, FieldGroup } from "@adscrush/ui/components/field"
import { IconEdit, IconExternalLink } from "@tabler/icons-react"

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
  updatedAt: string
}

interface Employee {
  id: string
  name: string
}

export default function AdvertiserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)

  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    website: "",
    country: "",
    accountManagerId: "",
    status: "active" as "active" | "inactive" | "pending",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [advertiserRes, employeesRes] = await Promise.all([
          api.advertisers[resolvedParams.id].get(),
          api.employees.get("limit=100"),
        ])

        if (advertiserRes.data?.success && advertiserRes.data.data) {
          const data = advertiserRes.data.data
          setAdvertiser(data)
          setFormData({
            name: data.name || "",
            companyName: data.companyName || "",
            email: data.email || "",
            website: data.website || "",
            country: data.country || "",
            accountManagerId: data.accountManagerId || "",
            status: data.status || "active",
          })
        }

        if (employeesRes.data?.success && employeesRes.data.data) {
          setEmployees(employeesRes.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch advertiser:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.id])

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const payload = {
        ...formData,
        accountManagerId: formData.accountManagerId || undefined,
        website: formData.website || undefined,
      }

      const response = await api.advertisers[resolvedParams.id].put(
        payload as never
      )
      if (response.data?.success && response.data.data) {
        setAdvertiser(response.data.data)
        setIsEditing(false)
      } else {
        setError(response.data?.error || "Failed to update advertiser")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update advertiser"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Advertiser Details" description="Loading..." />
      </div>
    )
  }

  if (!advertiser) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Advertiser Not Found"
          description="The advertiser could not be found"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={advertiser.name}
        description="View and manage advertiser details"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/advertisers">Back</Link>
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

      <div className="max-w-2xl">
        <div className="rounded-lg border p-4">
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
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={
                      advertiser.status === "active"
                        ? "default"
                        : advertiser.status === "pending"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {advertiser.status}
                  </Badge>
                )}
              </Field>

              <Field>
                <FieldLabel>Company Name</FieldLabel>
                {isEditing ? (
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm">
                    {advertiser.companyName || "Not set"}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm">{advertiser.email}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Website</FieldLabel>
                {isEditing ? (
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                ) : advertiser.website ? (
                  <a
                    href={advertiser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {advertiser.website}
                    <IconExternalLink className="size-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Country</FieldLabel>
                {isEditing ? (
                  <Input
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm">{advertiser.country || "Not set"}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Account Manager</FieldLabel>
                {isEditing ? (
                  <Select
                    value={formData.accountManagerId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, accountManagerId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm">
                    {advertiser.accountManager?.name || "Not assigned"}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Created At</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {new Date(advertiser.createdAt).toLocaleString()}
                </p>
              </Field>
            </FieldGroup>
          </Field>
        </div>
      </div>
    </div>
  )
}
