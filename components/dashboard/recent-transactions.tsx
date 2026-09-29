"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import type { Summary } from "@/features/summary/api/use-get-summary";

export const RecentTransactions = ({ data }: { data: Summary }) => {
  const { formatMiliunits } = useCurrency();
  const items = data.recentTransactions;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <CardDescription>Latest activity in this period</CardDescription>
        </div>
        <Link
          href="/transactions"
          className="inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Receipt className="size-8 opacity-40" />
            No transactions in this period
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((t) => {
              const income = t.amount >= 0;
              const name = t.category ?? "Uncategorized";
              return (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <div
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase text-muted-foreground"
                  >
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.payee}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {name} · {t.account}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        income && "text-success",
                      )}
                    >
                      {income ? "+" : "−"}
                      {formatMiliunits(Math.abs(t.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "MMM d")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentTransactionsLoading = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-4 w-36" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </CardContent>
  </Card>
);
