"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateAffiliateSchema } from "@adscrush/shared/validators/affiliate.validator"
import type { z } from "zod"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adscrush/ui/components/dialog"
import { Input } from "@adscrush/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { Field, FieldLabel } from "@adscrush/ui/components/field"
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "@adscrush/ui/sonner"
import { useUpdateAffiliate } from "../queries"
import type { Affiliate } from "../queries"

const editSchema = updateAffiliateSchema.partial()

type EditAffiliateInput = z.infer<typeof editSchema>

interface UpdateAffiliateDialogProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Dialog>,
  "children"
> {
  affiliate: Affiliate | null
}

export function UpdateAffiliateDialog({
  affiliate,
  open,
  onOpenChange,
}: UpdateAffiliateDialogProps) {
  const updateMutation = useUpdateAffiliate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditAffiliateInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: affiliate?.name || "",
      companyName: affiliate?.companyName || "",
      email: affiliate?.email || "",
      status: affiliate?.status || "active",
    },
  })

  React.useEffect(() => {
    if (open && affiliate) {
      reset({
        name: affiliate.name,
        companyName: affiliate.companyName || "",
        email: affiliate.email,
        status: affiliate.status,
      })
    }
  }, [open, affiliate?.id])

  const onSubmit = async (data: EditAffiliateInput) => {
    if (!affiliate) return

    await updateMutation.mutateAsync(
      { id: affiliate.id, ...data },
      {
        onSuccess: () => {
          toast.success("Affiliate updated")
          onOpenChange?.(false)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const isLoading = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={affiliate?.id}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Affiliate</DialogTitle>
          <DialogDescription>Update affiliate details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Company</FieldLabel>
              <Input {...register("companyName")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={watch("status") || affiliate?.status || "active"}
                onValueChange={(val) =>
                  setValue("status", val as "active" | "inactive" | "pending")
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
