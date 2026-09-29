"use client";

import { FormSheet } from "@/app/components/form-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { CategoryForm } from "./category-form";
import { useOpenCategory } from "../hooks/use-open-category";
import { useGetCategory } from "../api/use-get-category";
import { useEditCategory } from "../api/use-edit-category";
import { useDeleteCategory } from "../api/use-delete-category";

export const EditCategorySheet = () => {
  const { isOpen, onClose, id } = useOpenCategory();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this category?",
    "Transactions in this category become uncategorized, and its budget (if any) is removed.",
    { confirmLabel: "Delete category" },
  );

  const query = useGetCategory(id);
  const editMutation = useEditCategory(id);
  const deleteMutation = useDeleteCategory(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;

  const onDelete = async () => {
    if (await confirm()) {
      deleteMutation.mutate(undefined, { onSuccess: onClose });
    }
  };

  return (
    <>
      <ConfirmDialog />
      <FormSheet
        open={isOpen}
        onOpenChange={onClose}
        title="Edit category"
        description="Rename it. Existing transactions stay linked."
      >
        {query.data ? (
          <CategoryForm
            key={id}
            id={id}
            defaultValue={{ name: query.data.name }}
            onSubmit={(values) =>
              editMutation.mutate(values, { onSuccess: onClose })
            }
            disabled={isPending}
            saving={editMutation.isPending}
            onDelete={onDelete}
          />
        ) : query.isError ? (
          <p className="text-sm text-destructive">
            Couldn&apos;t load this category.
          </p>
        ) : (
          <div className="space-y-3" aria-busy>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </FormSheet>
    </>
  );
};
