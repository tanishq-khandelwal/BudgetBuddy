"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import {
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
} from "@/lib/utils";
import { useGetBudgets } from "../api/use-get-budgets";
import { useGetBudget } from "../api/use-get-budget";
import { useCreateBudget } from "../api/use-create-budget";
import { useEditBudget } from "../api/use-edit-budget";
import { useDeleteBudget } from "../api/use-delete-budget";
import { useNewBudget } from "../hooks/use-new-budget";
import { useOpenBudget } from "../hooks/use-open-budget";
import { BudgetForm, type BudgetFormValues } from "./budget-form";

// Category options for the select; a category that already has a budget is
// hidden unless it is the one being edited.
const useCategoryOptions = (keepCategoryId?: string) => {
  const categories = useGetCategories();
  const budgets = useGetBudgets();
  const categoryMutation = useCreateCategory();

  const taken = new Set(
    (budgets.data?.data ?? [])
      .map((b) => b.categoryId)
      .filter((id) => id !== keepCategoryId),
  );
  const options = (categories.data ?? [])
    .filter((c) => !taken.has(c.id))
    .map((c) => ({ label: c.name, value: c.id }));

  return {
    options,
    isLoading: categories.isLoading || budgets.isLoading,
    onCreateCategory: (name: string) => categoryMutation.mutate({ name }),
  };
};

const NewBudgetSheet = () => {
  const { isOpen, onClose } = useNewBudget();
  const mutation = useCreateBudget();
  const { options, isLoading, onCreateCategory } = useCategoryOptions();

  const onSubmit = (values: BudgetFormValues) =>
    mutation.mutate(
      {
        categoryId: values.categoryId,
        amount: convertAmountToMiliunits(parseFloat(values.amount)),
      },
      { onSuccess: onClose },
    );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New budget</SheetTitle>
          <SheetDescription>
            Set a monthly spending limit for a category.
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <Loader2 className="mx-auto size-4 animate-spin" />
        ) : (
          <BudgetForm
            defaultValues={{ categoryId: "", amount: "" }}
            categoryOptions={options}
            onCreateCategory={onCreateCategory}
            onSubmit={onSubmit}
            disabled={mutation.isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

const EditBudgetSheet = () => {
  const { isOpen, onClose, id } = useOpenBudget();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Delete this budget?",
    "The category and its transactions are kept; only the limit is removed.",
  );

  const budgetQuery = useGetBudget(id);
  const editMutation = useEditBudget(id);
  const deleteMutation = useDeleteBudget(id);
  const { options, isLoading, onCreateCategory } = useCategoryOptions(
    budgetQuery.data?.categoryId,
  );

  const isPending = editMutation.isPending || deleteMutation.isPending;
  const loading = budgetQuery.isLoading || isLoading;

  const onSubmit = (values: BudgetFormValues) =>
    editMutation.mutate(
      {
        categoryId: values.categoryId,
        amount: convertAmountToMiliunits(parseFloat(values.amount)),
      },
      { onSuccess: onClose },
    );

  const onDelete = async () => {
    if (await confirm())
      deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  return (
    <>
      <ConfirmationDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit budget</SheetTitle>
            <SheetDescription>Change the limit or category.</SheetDescription>
          </SheetHeader>
          {loading || !budgetQuery.data ? (
            <Loader2 className="mx-auto size-4 animate-spin" />
          ) : (
            <BudgetForm
              key={budgetQuery.data.id}
              id={id}
              defaultValues={{
                categoryId: budgetQuery.data.categoryId,
                amount: String(
                  convertAmountFromMiliunits(budgetQuery.data.amount),
                ),
              }}
              categoryOptions={options}
              onCreateCategory={onCreateCategory}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export const BudgetSheets = () => (
  <>
    <NewBudgetSheet />
    <EditBudgetSheet />
  </>
);
