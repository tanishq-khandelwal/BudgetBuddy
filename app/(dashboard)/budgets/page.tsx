import { Suspense } from "react";
import { BudgetsView } from "@/features/budgets/components/budgets-view";

export default function BudgetsPage() {
  return (
    <Suspense>
      <BudgetsView />
    </Suspense>
  );
}
