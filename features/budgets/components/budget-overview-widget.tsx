"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { useGetBudgets } from "../api/use-get-budgets";
import { useNewBudget } from "../hooks/use-new-budget";
import { BudgetBar } from "./budget-bar";

export const BudgetOverviewWidget = () => {
  const { formatMiliunits } = useCurrency();
  const onNew = useNewBudget((s) => s.onOpen);
  const { data, isLoading, isError } = useGetBudgets(
    format(new Date(), "yyyy-MM"),
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const budgets = data?.data ?? [];

  if (isError || budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PiggyBank className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">
              {isError ? "Couldn't load budgets" : "Budgets this month"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isError
                ? "Try refreshing the page."
                : "Set monthly limits per category and see how you're tracking."}
            </p>
          </div>
          {!isError && (
            <Button className="h-10" onClick={onNew}>
              Create a budget
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { totals } = data!;
  const overall = totals.budgeted ? (totals.spent / totals.budgeted) * 100 : 0;
  const top = [...budgets]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Budgets this month</CardTitle>
        <CardDescription>
          {formatMiliunits(totals.spent)} of {formatMiliunits(totals.budgeted)}{" "}
          spent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <BudgetBar
          percentage={overall}
          label="Overall budget used"
          className="h-2.5"
        />
        <ul className="space-y-4">
          {top.map((b) => (
            <li key={b.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {b.categoryName}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatMiliunits(b.spent)} / {formatMiliunits(b.amount)}
                </span>
              </div>
              <BudgetBar
                percentage={b.percentage}
                label={`${b.categoryName} budget used`}
                className="h-1.5"
              />
            </li>
          ))}
        </ul>
        <Button asChild variant="ghost" className="-ml-3 h-10">
          <Link href="/budgets">
            Manage budgets <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
