"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  addMonths,
  format,
  getDaysInMonth,
  isSameMonth,
  parse,
  subMonths,
} from "date-fns";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { useGetBudgets } from "../api/use-get-budgets";
import { useNewBudget } from "../hooks/use-new-budget";
import { useOpenBudget } from "../hooks/use-open-budget";
import { BudgetBar, budgetState } from "./budget-bar";

const MONTH_FORMAT = "yyyy-MM";

export const BudgetsView = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { formatMiliunits } = useCurrency();
  const onNew = useNewBudget((s) => s.onOpen);
  const onEdit = useOpenBudget((s) => s.onOpen);

  const now = new Date();
  const monthParam = params.get("month");
  const parsed = monthParam ? parse(monthParam, MONTH_FORMAT, new Date()) : now;
  const date = Number.isNaN(parsed.getTime()) ? now : parsed;
  const month = format(date, MONTH_FORMAT);
  const isCurrent = isSameMonth(date, now);

  const setMonth = (d: Date) =>
    router.replace(
      isSameMonth(d, now)
        ? "/budgets"
        : `/budgets?month=${format(d, MONTH_FORMAT)}`,
      { scroll: false },
    );

  const { data, isLoading, isError, refetch } = useGetBudgets(month);

  const budgets = [...(data?.data ?? [])].sort(
    (a, b) => b.percentage - a.percentage,
  );
  const over = budgets.filter((b) => b.percentage > 100);
  const totals = data?.totals;
  const overall = totals?.budgeted ? (totals.spent / totals.budgeted) * 100 : 0;
  const daysLeft = getDaysInMonth(now) - now.getDate() + 1;

  const actions = (
    <>
      <div className="flex items-center rounded-lg border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="Previous month"
          onClick={() => setMonth(subMonths(date, 1))}
        >
          <ChevronLeft />
        </Button>
        <span
          className="min-w-28 px-1 text-center text-sm font-medium tabular-nums"
          aria-live="polite"
        >
          {format(date, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(date, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
      {!isCurrent && (
        <Button
          variant="outline"
          className="h-10"
          onClick={() => setMonth(now)}
        >
          This month
        </Button>
      )}
      <Button className="h-10" onClick={onNew}>
        <Plus /> New budget
      </Button>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Budgets"
        description="Set monthly limits per category and stay on track."
        actions={actions}
      />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load budgets"
          description="Something went wrong while fetching your budgets."
          action={
            <Button
              variant="outline"
              className="h-10"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          }
        />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Create a monthly limit for a category to see how much you can still spend."
          action={
            <Button className="h-10" onClick={onNew}>
              <Plus /> Create your first budget
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {over.length > 0 && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p>
                <span className="font-medium text-destructive">
                  Over budget:{" "}
                </span>
                {over.map((b) => b.categoryName).join(", ")}
              </p>
            </div>
          )}

          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Spent so far</p>
                  <p className="text-3xl font-semibold tabular-nums tracking-tight">
                    {formatMiliunits(totals!.spent)}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      / {formatMiliunits(totals!.budgeted)}
                    </span>
                  </p>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    totals!.remaining < 0 ? "text-destructive" : "text-success",
                  )}
                >
                  {totals!.remaining < 0
                    ? `Over by ${formatMiliunits(-totals!.remaining)}`
                    : `${formatMiliunits(totals!.remaining)} remaining`}
                </p>
              </div>
              <BudgetBar
                percentage={overall}
                label="Total budget used"
                className="h-3"
              />
              {isCurrent && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  </span>
                  {totals!.remaining > 0 && (
                    <span>
                      Safe to spend{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatMiliunits(
                          Math.floor(totals!.remaining / daysLeft),
                        )}
                      </span>{" "}
                      per day
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((b) => {
              const state = budgetState(b.percentage);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onEdit(b.id)}
                  className="rounded-xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          state === "over"
                            ? "bg-destructive"
                            : state === "warn"
                              ? "bg-warning"
                              : "bg-primary",
                        )}
                      />
                      <h3 className="truncate font-medium">{b.categoryName}</h3>
                    </div>
                    {state === "over" ? (
                      <Badge variant="destructive">Over budget</Badge>
                    ) : (
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {Math.round(b.percentage)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm tabular-nums">
                    <span className="text-xl font-semibold">
                      {formatMiliunits(b.spent)}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {formatMiliunits(b.amount)}
                    </span>
                  </p>
                  <BudgetBar
                    percentage={b.percentage}
                    label={`${b.categoryName} budget used`}
                    className="mt-3"
                  />
                  <p
                    className={cn(
                      "mt-3 text-sm tabular-nums",
                      b.remaining < 0
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {b.remaining < 0
                      ? `${formatMiliunits(-b.remaining)} overspent`
                      : `${formatMiliunits(b.remaining)} left`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && !isError && (data?.unbudgetedSpent ?? 0) > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatMiliunits(data!.unbudgetedSpent)}
            </span>{" "}
            of unbudgeted spending this month.
          </p>
          <Button variant="outline" className="h-10" onClick={onNew}>
            Create a budget
          </Button>
        </div>
      )}
    </div>
  );
};
