"use client";

import { RowActions } from "@/app/components/row-actions";
import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useDeleteCategory } from "@/features/categories/api/use-delete-category";
import { useConfirm } from "@/hooks/use-confirm";

type Props = {
  id: string;
  name: string;
};

export const Actions = ({ id, name }: Props) => {
  const { onOpen } = useOpenCategory();
  const deleteMutation = useDeleteCategory(id);
  const [ConfirmDialog, confirm] = useConfirm(
    `Delete "${name}"?`,
    "Transactions in this category become uncategorized, and its budget (if any) is removed.",
    { confirmLabel: "Delete category" },
  );

  return (
    <>
      <ConfirmDialog />
      <RowActions
        label={name}
        disabled={deleteMutation.isPending}
        onEdit={() => onOpen(id)}
        onDelete={async () => {
          if (await confirm()) deleteMutation.mutate();
        }}
      />
    </>
  );
};
