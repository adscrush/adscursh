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
import { Field, FieldLabel, FieldGroup } from "@adscrush/ui/components/field"
import { IconArrowLeft } from "@tabler/icons-react"

interface Employee {
  id: string
  name: string
}

export default function NewAffiliatePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
    accountManagerId: "",
    status: "active" as "active" | "inactive" | "pending",
  })

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await api.employees.get("limit=100")
        if (response.data?.success && response.data.data) {
          setEmployees(response.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const payload = {
        ...formData,
        accountManagerId: formData.accountManagerId || undefined,
      }

      const response = await api.affiliates.post(payload as never)
      if (response.data?.success && response.data.data) {
        router.push(`/affiliates/${response.data.data.id}`)
      } else {
        setError(response.data?.error || "Failed to create affiliate")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create affiliate"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create Affiliate" description="Loading..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Affiliate"
        description="Add a new affiliate to your network"
      >
        <Link href="/affiliates">
          <Button variant="outline">
            <IconArrowLeft className="mr-2 size-4" />
            Back to Affiliates
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
              <FieldLabel>Name *</FieldLabel>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter affiliate name"
              />
            </Field>

            <Field>
              <FieldLabel>Company Name</FieldLabel>
              <Input
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Enter company name"
              />
            </Field>

            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="affiliate@example.com"
              />
            </Field>

            <Field>
              <FieldLabel>Temporary Password *</FieldLabel>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Minimum 8 characters"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The affiliate will be prompted to change this password on first
                login
              </p>
            </Field>

            <Field>
              <FieldLabel>Account Manager</FieldLabel>
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
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </Field>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Affiliate"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/affiliates">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
