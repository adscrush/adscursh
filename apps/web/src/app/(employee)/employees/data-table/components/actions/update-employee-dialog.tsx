"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateEmployeeSchema, type UpdateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { Button } from "@adscrush/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@adscrush/ui/components/dialog"
import { Input } from "@adscrush/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@adscrush/ui/components/select"
import { Field, FieldLabel } from "@adscrush/ui/components/field"
import { Badge } from "@adscrush/ui/components/badge"
import { IconCircleCheckFilled, IconCircleXFilled, IconBan, IconLoader2 } from "@tabler/icons-react"
import { toast } from "@adscrush/ui/sonner"
import { updateEmployee } from "../../../actions"
import type { Employee } from "../../../lib/types"

interface UpdateEmployeeDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  employee: Employee | null
}

export const UpdateEmployeeDialog = ({ employee, open, onOpenChange }: UpdateEmployeeDialogProps) => {
  const [isPending, startTransition] = React.useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      department: employee?.department || "",
      status: employee?.status || "active",
    },
  })

  React.useEffect(() => {
    if (open && employee) {
      reset({
        department: employee.department || "",
        status: employee.status,
      })
    }
  }, [open, employee?.id])

  const onSubmit = async (data: UpdateEmployeeInput) => {
    if (!employee) return

    startTransition(async () => {
      const { error } = await updateEmployee({
        id: employee.id,
        ...data,
      })

      if (error) {
        toast.error(error)
        return
      }

      toast.success("Employee updated")
      onOpenChange?.(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={employee?.id}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee details and status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
          <div>
            <p className="text-sm font-medium text-foreground">{employee?.name}</p>
            <p className="text-xs text-muted-foreground">{employee?.email}</p>
          </div>
          <Field>
            <FieldLabel>Department / Group</FieldLabel>
            <Input placeholder="e.g. Administrator, Sales" {...register("department")} />
            {errors.department && <p className="text-sm text-destructive mt-1">{errors.department.message}</p>}
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={(employee?.status as UpdateEmployeeInput["status"]) || "active"}
              onValueChange={(val) => setValue("status", val as UpdateEmployeeInput["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <Badge variant="outline" className="gap-1.5 px-2">
                    <IconCircleCheckFilled className="size-3 text-green-700 dark:text-green-400" />
                    Active
                  </Badge>
                </SelectItem>
                <SelectItem value="inactive">
                  <Badge variant="outline" className="gap-1.5 px-2">
                    <IconCircleXFilled className="size-3 text-gray-500 dark:text-gray-400" />
                    Inactive
                  </Badge>
                </SelectItem>
                <SelectItem value="suspended">
                  <Badge variant="outline" className="gap-1.5 px-2">
                    <IconBan className="size-3 text-red-500 dark:text-red-400" />
                    Suspended
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={isPending} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
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
