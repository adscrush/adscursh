"use client"

import { useState, useEffect } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adscrush/ui/components/table"
import { Field, FieldLabel, FieldGroup } from "@adscrush/ui/components/field"
import {
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconExternalLink,
} from "@tabler/icons-react"
import { use } from "react"

interface LandingPage {
  id: string
  name: string
  url: string
  weight: number
  status: "active" | "inactive"
  offerId: string
}

export default function LandingPagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLp, setEditingLp] = useState<LandingPage | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    weight: 1,
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    async function fetchLandingPages() {
      try {
        const response =
          await api.offers[resolvedParams.id]["landing-pages"].get()
        if (response.data?.success && response.data.data) {
          setLandingPages(response.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch landing pages:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLandingPages()
  }, [resolvedParams.id])

  const handleCreateOrUpdate = async () => {
    setSaving(true)
    try {
      if (editingLp) {
        const response = await api.offers[resolvedParams.id]["landing-pages"][
          editingLp.id
        ].put(formData as never)
        if (response.data?.success) {
          const updated = landingPages.map((lp) =>
            lp.id === editingLp.id ? { ...lp, ...formData } : lp
          )
          setLandingPages(updated)
        }
      } else {
        const response = await api.offers[resolvedParams.id][
          "landing-pages"
        ].post(formData as never)
        if (response.data?.success && response.data.data) {
          setLandingPages([...landingPages, response.data.data])
        }
      }
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Failed to save landing page:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this landing page?")) return

    try {
      const response =
        await api.offers[resolvedParams.id]["landing-pages"][id].delete()
      if (response.data?.success) {
        setLandingPages(landingPages.filter((lp) => lp.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete landing page:", err)
    }
  }

  const openEditDialog = (lp: LandingPage) => {
    setEditingLp(lp)
    setFormData({
      name: lp.name,
      url: lp.url,
      weight: lp.weight,
      status: lp.status,
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingLp(null)
    resetForm()
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      weight: 1,
      status: "active",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Pages"
        description="Manage landing pages for this offer"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/offers/${resolvedParams.id}`}>Back to Offer</Link>
          </Button>
          <Button onClick={openCreateDialog}>
            <IconPlus className="mr-2 size-4" />
            Add Landing Page
          </Button>
        </div>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-48 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : landingPages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-48 text-center text-muted-foreground"
                >
                  No landing pages found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              landingPages.map((lp) => (
                <TableRow key={lp.id}>
                  <TableCell className="font-medium">{lp.name}</TableCell>
                  <TableCell>
                    <a
                      href={lp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {lp.url}
                      <IconExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell>{lp.weight}</TableCell>
                  <TableCell>
                    <Badge
                      variant={lp.status === "active" ? "default" : "secondary"}
                    >
                      {lp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(lp)}
                      >
                        <IconEdit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(lp.id)}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLp ? "Edit Landing Page" : "Add Landing Page"}
            </DialogTitle>
            <DialogDescription>
              {editingLp
                ? "Update the landing page details"
                : "Add a new landing page for this offer"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Name *</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter landing page name"
              />
            </Field>
            <Field>
              <FieldLabel>URL *</FieldLabel>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/landing"
              />
            </Field>
            <Field>
              <FieldLabel>Weight</FieldLabel>
              <Input
                type="number"
                min="1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseInt(e.target.value) || 1,
                  })
                }
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
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrUpdate}
              disabled={saving || !formData.name || !formData.url}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
