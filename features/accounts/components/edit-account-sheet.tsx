"use client";

import { FormSheet } from "@/app/components/form-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { AccountForm } from "./account-form";
import { useOpenAccount } from "../hooks/use-open-account";
import { useGetAccount } from "../api/use-get-account";
import { useEditAccount } from "../api/use-edit-account";
import { useDeleteAccount } from "../api/use-delete-account";

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this account?",
    "This permanently deletes the account and all of its transactions. This can't be undone.",
    { confirmLabel: "Delete account" },
  );

  const query = useGetAccount(id);
  const editMutation = useEditAccount(id);
  const deleteMutation = useDeleteAccount(id);
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
        title="Edit account"
        description="Rename it. Existing transactions stay linked."
      >
        {query.data ? (
          <AccountForm
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
            Couldn&apos;t load this account.
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
