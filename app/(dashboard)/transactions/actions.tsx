"use client";

import { RowActions } from "@/app/components/row-actions";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useConfirm } from "@/hooks/use-confirm";

type Props = {
  id: string;
  payee: string;
};

export const Actions = ({ id, payee }: Props) => {
  const { onOpen } = useOpenTransaction();
  const deleteMutation = useDeleteTransaction(id);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this transaction?",
    `"${payee}" will be removed. This can't be undone.`,
    { confirmLabel: "Delete transaction" },
  );

  return (
    <>
      <ConfirmDialog />
      <RowActions
        label={payee}
        disabled={deleteMutation.isPending}
        onEdit={() => onOpen(id)}
        onDelete={async () => {
          if (await confirm()) deleteMutation.mutate();
        }}
      />
    </>
  );
};
