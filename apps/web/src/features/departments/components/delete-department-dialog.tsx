"use client"

import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adscrush/ui/components/dialog"
import { toast } from "@adscrush/ui/sonner"
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react"
import type { Department } from "../queries"
import { useDeleteDepartment } from "../queries"

interface DeleteDepartmentDialogProps {
  department: Department | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDepartmentDialog({
  department,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDepartmentDialogProps) {
  const deleteMutation = useDeleteDepartment()

  const handleDelete = async () => {
    if (!department) return

    await deleteMutation.mutateAsync(department.id, {
      onSuccess: () => {
        toast.success("Department deleted")
        onOpenChange?.(false)
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  const isLoading = deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={department?.id}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="size-5 text-destructive" />
            Delete Department
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this department? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {department && (
          <div className="rounded-md bg-muted p-4">
            <p className="font-medium">{department.name}</p>
            {department.description && (
              <p className="text-sm text-muted-foreground">
                {department.description}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
