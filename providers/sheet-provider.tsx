"use client";

import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet";
import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";
import { BudgetSheets } from "@/features/budgets/components/budget-sheets";
import { RecurringSheets } from "@/features/recurring/components/recurring-sheets";
import { useSyncExternalStore } from "react";

export const SheetProvider = () => {
  // Sheets render client-only, so they never cause a hydration mismatch.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />

      <NewCategorySheet />
      <EditCategorySheet />

      <NewTransactionSheet />
      <EditTransactionSheet />

      <BudgetSheets />
      <RecurringSheets />
    </>
  );
};
