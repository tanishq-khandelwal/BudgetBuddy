"use client";

import { Loader2 } from "lucide-react";
import { FormSheet } from "@/app/components/form-sheet";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useOpenTransaction } from "../hooks/use-open-transaction";
import { useTransactionFormOptions } from "../hooks/use-form-options";
import { useGetTransaction } from "../api/use-get-transaction";
import { useEditTransactions } from "../api/use-edit-transaction";
import { useDeleteTransaction } from "../api/use-delete-transaction";
import { TransactionForm } from "./transaction-form";

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this transaction?",
    "This can't be undone.",
    { confirmLabel: "Delete transaction" },
  );

  const transactionQuery = useGetTransaction(id);
  const editMutation = useEditTransactions(id);
  const deleteMutation = useDeleteTransaction(id);
  const options = useTransactionFormOptions();

  const onDelete = async () => {
    if (await confirm()) {
      deleteMutation.mutate(undefined, { onSuccess: onClose });
    }
  };

  const t = transactionQuery.data;
  const isLoading = transactionQuery.isLoading || options.isLoading;

  return (
    <>
      <ConfirmDialog />
      <FormSheet
        open={isOpen}
        onOpenChange={onClose}
        title="Edit transaction"
        description="Update the details of this transaction."
      >
        {t && !isLoading ? (
          <TransactionForm
            key={id}
            id={id}
            defaultValue={{
              accountId: t.accountId,
              categoryId: t.categoryId,
              amount: convertAmountFromMiliunits(t.amount).toString(),
              date: new Date(t.date),
              payee: t.payee,
              notes: t.notes,
            }}
            onSubmit={(values) =>
              editMutation.mutate(values, { onSuccess: onClose })
            }
            onDelete={onDelete}
            disabled={
              editMutation.isPending ||
              deleteMutation.isPending ||
              options.isPending
            }
            saving={editMutation.isPending}
            accountOptions={options.accountOptions}
            categoryOptions={options.categoryOptions}
            onCreateAccount={options.onCreateAccount}
            onCreateCategory={options.onCreateCategory}
          />
        ) : transactionQuery.isError ? (
          <p className="text-sm text-destructive">
            Couldn&apos;t load this transaction.
          </p>
        ) : (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </FormSheet>
    </>
  );
};
