"use client";

import { FormSheet } from "@/app/components/form-sheet";
import { useNewAccount } from "../hooks/use-new-accounts";
import { AccountForm } from "./account-form";
import { useCreateAccount } from "../api/use-create-account";

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount();
  const mutation = useCreateAccount();

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={onClose}
      title="New account"
      description="Add an account to track balances and group your transactions."
    >
      <AccountForm
        onSubmit={(values) => mutation.mutate(values, { onSuccess: onClose })}
        disabled={mutation.isPending}
        saving={mutation.isPending}
      />
    </FormSheet>
  );
};
