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
import { updateEmployeeSchema, type UpdateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { toast } from "@adscrush/ui/sonner"
import { IconLoader2 } from "@tabler/icons-react"

interface Employee {
  id: string
  userId: string
  name: string
  email: string
  role: string
  department: string | null
  status: string
}

interface EditEmployeeDialogProps {
  open?: boolean
  employee: Employee
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ open, employee, onOpenChange }: EditEmployeeDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)

  useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      department: employee.department ?? "",
      status: employee.status as UpdateEmployeeInput["status"],
    },
  })

  useEffect(() => {
    reset({
      department: employee.department ?? "",
      status: employee.status as UpdateEmployeeInput["status"],
    })
  }, [employee, reset])

  const onSubmit = async (data: UpdateEmployeeInput) => {
    try {
      const response = await api.employees.put(employee.id, data as any)
      if (response.data?.success) {
        toast.success("Employee updated successfully!")
        setIsOpen(false)
        onOpenChange(false)
      } else {
        toast.error(response.data?.error || "Failed to update employee")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const currentStatus = (employee.status as UpdateEmployeeInput["status"]) ?? "active"

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); reset(); onOpenChange(val); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update details for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FieldGroup>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-muted flex size-10 items-center justify-center rounded-full text-sm font-semibold uppercase">
                {employee.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
            </div>

            <Field>
              <FieldLabel>Department / Group</FieldLabel>
              <Input
                {...register("department")}
                placeholder="e.g. Administrator, Sales"
              />
              {errors.department && <p className="text-sm text-destructive mt-1">{errors.department.message}</p>}
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select value={employee.role} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">Role is tied to authentication and cannot be changed here.</p>
            </Field>

            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={currentStatus}
                onValueChange={(val) => setValue("status", val as UpdateEmployeeInput["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </Field>
          </FieldGroup>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setIsOpen(false); onOpenChange(false); }}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
