"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
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
import { createAdvertiserSchema, type CreateAdvertiserInput } from "@adscrush/shared/validators/advertiser.validator"
import { toast } from "@adscrush/ui/sonner"
import { IconLoader2 } from "@tabler/icons-react"

interface Employee {
  id: string
  name: string
}

interface AddAdvertiserDialogProps {
  children?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  onCreated?: () => void
}

export function AddAdvertiserDialog({ children, onOpenChange, onCreated }: AddAdvertiserDialogProps) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdvertiserInput>({
    resolver: zodResolver(createAdvertiserSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
      website: "",
      country: "",
      accountManagerId: "",
      status: "active",
    },
  })

  // Watch for select values since they aren't standard inputs
  const currentStatus = watch("status")
  const currentAccountManagerId = watch("accountManagerId")

  useEffect(() => {
    if (open) {
      async function fetchEmployees() {
        try {
          const response = await api.employees.get("limit=100")
          if (response.data?.success && response.data.data) {
            setEmployees(response.data.data)
          }
        } catch (err) {
          console.error("Failed to fetch employees:", err)
        } finally {
          setLoadingEmployees(false)
        }
      }
      fetchEmployees()
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (onOpenChange) onOpenChange(newOpen)
    if (!newOpen) reset()
  }

  const onSubmit = async (data: CreateAdvertiserInput) => {
    try {
      const payload = {
        ...data,
        accountManagerId: data.accountManagerId || undefined,
        website: data.website || undefined,
        companyName: data.companyName || undefined,
        country: data.country || undefined,
      }

      const response = await api.advertisers.post(payload as never)
      if (response.data?.success && response.data.data) {
        toast.success("Advertiser created successfully!")
        handleOpenChange(false)
        if (onCreated) onCreated()
      } else {
        toast.error(response.data?.error || "Failed to create advertiser")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create advertiser")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertiser</DialogTitle>
          <DialogDescription>
            Add a new advertiser to your network
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                    <FieldLabel>Name *</FieldLabel>
                    <Input
                        required
                        {...register("name")}
                        placeholder="Enter advertiser name"
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Company Name</FieldLabel>
                    <Input
                        {...register("companyName")}
                        placeholder="Enter company name"
                    />
                    {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Email *</FieldLabel>
                    <Input
                        required
                        type="email"
                        {...register("email")}
                        placeholder="advertiser@example.com"
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Temporary Password *</FieldLabel>
                    <Input
                        required
                        type="password"
                        {...register("password")}
                        placeholder="Minimum 8 characters"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        The advertiser will be prompted to change this password on first login
                    </p>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Website</FieldLabel>
                    <Input
                        type="url"
                        {...register("website")}
                        placeholder="https://example.com"
                    />
                    {errors.website && <p className="text-sm text-destructive mt-1">{errors.website.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Country</FieldLabel>
                    <Input
                        {...register("country")}
                        placeholder="e.g., US, UK, CA"
                    />
                    {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
                </Field>

                <Field>
                    <FieldLabel>Account Manager</FieldLabel>
                    <Select
                        value={currentAccountManagerId}
                        onValueChange={(value) => setValue("accountManagerId", value)}
                        disabled={loadingEmployees}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select account manager"} />
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
                        value={currentStatus}
                        onValueChange={(value) => setValue("status", value as any)}
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
            </div>
          </FieldGroup>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-background pb-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
              ) : "Create Advertiser"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
