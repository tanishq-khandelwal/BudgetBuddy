"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useNewRecurring } from "../hooks/use-new-recurring";
import { useOpenRecurring } from "../hooks/use-open-recurring";
import { useCreateRecurring } from "../api/use-create-recurring";
import { useEditRecurring } from "../api/use-edit-recurring";
import { useDeleteRecurring } from "../api/use-delete-recurring";
import { useGetRecurring } from "../api/use-get-recurring";
import { RecurringForm, type RecurringSubmit } from "./recurring-form";
import { RecurringProcessor } from "./recurring-processor";

// Account/category data and mutations shared by both sheets. Only called from
// bodies that mount while a sheet is open, so nothing fetches on public pages.
const useRefs = () => {
  const accounts = useGetAccounts();
  const categories = useGetCategories();
  const createAccount = useCreateAccount();
  const createCategory = useCreateCategory();
  return {
    isLoading: accounts.isLoading || categories.isLoading,
    isPending: createAccount.isPending || createCategory.isPending,
    accountOptions: (accounts.data ?? []).map((a) => ({
      label: a.name,
      value: a.id,
    })),
    categoryOptions: (categories.data ?? []).map((c) => ({
      label: c.name,
      value: c.id,
    })),
    onCreateAccount: (name: string) => createAccount.mutate({ name }),
    onCreateCategory: (name: string) => createCategory.mutate({ name }),
  };
};

const Spinner = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="size-5 animate-spin text-muted-foreground" />
  </div>
);

const NewBody = ({ onClose }: { onClose: () => void }) => {
  const refs = useRefs();
  const create = useCreateRecurring();

  if (refs.isLoading) return <Spinner />;
  return (
    <RecurringForm
      onSubmit={(values: RecurringSubmit) =>
        create.mutate(values, { onSuccess: onClose })
      }
      disabled={create.isPending || refs.isPending}
      {...refs}
    />
  );
};

const EditBody = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const refs = useRefs();
  const query = useGetRecurring(id);
  const edit = useEditRecurring(id);
  const remove = useDeleteRecurring(id);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete recurring transaction?",
    "Transactions already created from it are kept. This can't be undone.",
  );

  const rule = query.data;
  if (refs.isLoading || query.isLoading || !rule) return <Spinner />;

  const onDelete = async () => {
    if (await confirm()) remove.mutate(undefined, { onSuccess: onClose });
  };

  return (
    <>
      <ConfirmDialog />
      <RecurringForm
        id={id}
        defaultValue={{
          type: rule.amount < 0 ? "expense" : "income",
          amount: Math.abs(convertAmountFromMiliunits(rule.amount)).toString(),
          payee: rule.payee,
          accountId: rule.accountId,
          categoryId: rule.categoryId,
          frequency: rule.frequency,
          startDate: new Date(rule.startDate),
          endDate: rule.endDate ? new Date(rule.endDate) : null,
          notes: rule.notes,
        }}
        onSubmit={(values) => edit.mutate(values, { onSuccess: onClose })}
        onDelete={onDelete}
        disabled={edit.isPending || remove.isPending || refs.isPending}
        {...refs}
      />
    </>
  );
};

export const RecurringSheets = () => {
  const newSheet = useNewRecurring();
  const openSheet = useOpenRecurring();

  return (
    <>
      <RecurringProcessor />

      <Sheet open={newSheet.isOpen} onOpenChange={newSheet.onClose}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New recurring transaction</SheetTitle>
            <SheetDescription>
              Automatically add a transaction on a schedule.
            </SheetDescription>
          </SheetHeader>
          <NewBody onClose={newSheet.onClose} />
        </SheetContent>
      </Sheet>

      <Sheet open={openSheet.isOpen} onOpenChange={openSheet.onClose}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit recurring transaction</SheetTitle>
            <SheetDescription>Update this schedule.</SheetDescription>
          </SheetHeader>
          {openSheet.id && (
            <EditBody id={openSheet.id} onClose={openSheet.onClose} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
