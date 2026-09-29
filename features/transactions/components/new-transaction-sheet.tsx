"use client";

import { Loader2 } from "lucide-react";
import { FormSheet } from "@/app/components/form-sheet";
import { useNewTransaction } from "../hooks/use-new-transaction";
import { useTransactionFormOptions } from "../hooks/use-form-options";
import { useCreateTransaction } from "../api/use-create-transaction";
import { TransactionForm } from "./transaction-form";

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction();
  const createMutation = useCreateTransaction();
  const options = useTransactionFormOptions();

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={onClose}
      title="New transaction"
      description="Record income or an expense."
    >
      {options.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TransactionForm
          onSubmit={(values) =>
            createMutation.mutate(values, { onSuccess: onClose })
          }
          disabled={createMutation.isPending || options.isPending}
          saving={createMutation.isPending}
          accountOptions={options.accountOptions}
          categoryOptions={options.categoryOptions}
          onCreateAccount={options.onCreateAccount}
          onCreateCategory={options.onCreateCategory}
        />
      )}
    </FormSheet>
  );
};
