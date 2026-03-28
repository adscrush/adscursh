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

interface EmployeeDetail {
  id: string
  userId: string
  name: string
  email: string
  role: string
  department: string | null
  status: string
  createdAt: string
  assignedAffiliateIds: string[]
  assignedAdvertiserIds: string[]
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [department, setDepartment] = useState("")

  useEffect(() => {
    apiGet<{ data: EmployeeDetail }>(`/api/employees/${params.id}`)
      .then((res) => {
        setEmployee(res.data)
        setStatus(res.data.status)
        setDepartment(res.data.department ?? "")
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPut(`/api/employees/${params.id}`, { status, department: department || undefined })
    } catch {
      // error handling
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-6">Loading...</div>
  if (!employee) return <div className="text-muted-foreground text-sm p-6">Employee not found</div>

  return (
    <div className="space-y-6">
      <PageHeader title={`Profile #${employee.id.slice(0, 8)}`} description={employee.name}>
        <StatusBadge status={employee.status} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={employee.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={employee.email} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={employee.role} disabled />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p>Assigned Affiliates: {employee.assignedAffiliateIds.length}</p>
            <p>Assigned Advertisers: {employee.assignedAdvertiserIds.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
