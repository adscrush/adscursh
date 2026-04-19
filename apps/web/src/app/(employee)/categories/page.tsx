"use client"

import * as React from "react"
import { useCategories, useDeleteCategory } from "@/features/offers/queries"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@adscrush/ui/components/button"
import { IconPlus, IconTag, IconTrash } from "@tabler/icons-react"
import { Card, CardContent } from "@adscrush/ui/components/card"
import { AddCategoryDialog } from "@/features/offers/components/add-category-dialog"
import { toast } from "@adscrush/ui/sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@adscrush/ui/components/alert-dialog"

export default function CategoriesPage() {
  const { data, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id)
      toast.success("Category deleted successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete category")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <PageHeader title="Categories" description="Manage your offer categories">
        <AddCategoryDialog>
          <Button size="sm">
            <IconPlus className="mr-2 size-3.5" />
            Add Category
          </Button>
        </AddCategoryDialog>
      </PageHeader>

      <div className="flex flex-1 flex-col gap-4">
        <Card>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Created At
                    </th>
                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="h-24 text-center align-middle">
                        Loading categories...
                      </td>
                    </tr>
                  ) : data?.data && data.data.length > 0 ? (
                    data.data.map((category: any) => (
                      <tr
                        key={category.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">
                          <div className="flex items-center gap-2">
                            <IconTag className="size-4 text-muted-foreground" />
                            {category.name}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {category.description || "-"}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right align-middle">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive/90"
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                              <AlertDialogHeader>
                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                  <IconTrash className="size-5" />
                                </AlertDialogMedia>
                                <AlertDialogTitle>
                                  Delete category?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This category
                                  will be permanently removed from your system
                                  if it is not assigned to any existing offers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => handleDelete(category.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="h-24 text-center align-middle">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
