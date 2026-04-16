"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateAdvertiserSchema } from "@adscrush/shared/validators/advertiser.schema"
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
import { useUpdateAdvertiser } from "../queries"
import type { Advertiser } from "../queries"

const editSchema = updateAdvertiserSchema.partial()

type EditAdvertiserInput = z.infer<typeof editSchema>

interface UpdateAdvertiserDialogProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Dialog>,
  "children"
> {
  advertiser: Advertiser | null
}

export function UpdateAdvertiserDialog({
  advertiser,
  open,
  onOpenChange,
}: UpdateAdvertiserDialogProps) {
  const updateMutation = useUpdateAdvertiser()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditAdvertiserInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: advertiser?.name || "",
      companyName: advertiser?.companyName || "",
      email: advertiser?.email || "",
      status: advertiser?.status || "active",
    },
  })

  React.useEffect(() => {
    if (open && advertiser) {
      reset({
        name: advertiser.name,
        companyName: advertiser.companyName || "",
        email: advertiser.email,
        status: advertiser.status,
      })
    }
  }, [open, advertiser?.id])

  const onSubmit = async (data: EditAdvertiserInput) => {
    if (!advertiser) return

    await updateMutation.mutateAsync(
      { id: advertiser.id, ...data },
      {
        onSuccess: () => {
          toast.success("Advertiser updated")
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
    <Dialog open={open} onOpenChange={onOpenChange} key={advertiser?.id}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Advertiser</DialogTitle>
          <DialogDescription>Update advertiser details.</DialogDescription>
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
            <Field>
              <FieldLabel>Website</FieldLabel>
              <Input {...register("website")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Input {...register("country")} />
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={watch("status") || advertiser?.status || "active"}
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
