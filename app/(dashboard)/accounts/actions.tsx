"use client";

import { RowActions } from "@/app/components/row-actions";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { useConfirm } from "@/hooks/use-confirm";

type Props = {
  id: string;
  name: string;
};

export const Actions = ({ id, name }: Props) => {
  const { onOpen } = useOpenAccount();
  const deleteMutation = useDeleteAccount(id);
  const [ConfirmDialog, confirm] = useConfirm(
    `Delete "${name}"?`,
    "This permanently deletes the account and all of its transactions. This can't be undone.",
    { confirmLabel: "Delete account" },
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
