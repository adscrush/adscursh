"use client"

import type { Employee } from "../queries"
import type { UpdateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { updateEmployeeSchema } from "@adscrush/shared/validators/employee.validator"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adscrush/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@adscrush/ui/components/field"
import { toast } from "@adscrush/ui/sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { useEffect } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { useUpdateEmployee } from "../queries"
import { useDepartments } from "@/features/departments/queries"
import type { GetDepartmentsSchema } from "@/features/departments/validations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"

interface UpdateEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export function UpdateEmployeeDialog({
  open,
  onOpenChange,
  employee,
}: UpdateEmployeeDialogProps) {
  const updateMutation = useUpdateEmployee()
  const departmentParams: GetDepartmentsSchema = {
    filterFlag: "commandFilters",
    page: 1,
    perPage: 100,
    name: "",
    status: [],
    sort: [],
    filters: [],
    createdAt: [],
    joinOperator: "and",
  }
  const { data: departmentsResult } = useDepartments(departmentParams)
  const departments = departmentsResult?.data ?? []

  const form = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      departmentId: undefined,
      status: "active" as const,
    },
  })

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (employee) {
      reset({
        departmentId: employee.departmentId ?? undefined,
        status: employee.status as "active" | "inactive" | "suspended",
      })
    }
  }, [employee, reset])

  const onSubmit: SubmitHandler<UpdateEmployeeInput> = async (data) => {
    if (!employee) return

    await updateMutation.mutateAsync(
      { id: employee.id, ...data },
      {
        onSuccess: () => {
          toast.success("Employee updated successfully!")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee details and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium">Name</span>
              <span className="text-sm text-muted-foreground">
                {employee?.name}
              </span>
            </div>
            <div className="mt-2 grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">
                {employee?.email}
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Department</FieldLabel>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
