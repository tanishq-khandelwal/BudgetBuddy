import { Suspense } from "react";
import { BudgetsView } from "@/features/budgets/components/budgets-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Budgets" };

export default function BudgetsPage() {
  return (
    <Suspense>
      <BudgetsView />
    </Suspense>
  );
}
