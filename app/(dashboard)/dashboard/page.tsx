"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { DataCard, DataCardLoading } from "@/components/data-card";
import { DataCharts, DataChartsLoading } from "@/components/data-charts";
import { DateFilter } from "@/components/date-filter";
import { AccountFilter } from "@/components/account-filter";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Loader2,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const params = useSearchParams();
  const from = params.get("from");
  const to = params.get("to");

  const defaultTo = new Date();
  const defaultFrom = startOfMonth(defaultTo);

  const dateRangeLabel =
    from && to
      ? `${format(new Date(from), "MMM dd")} - ${format(new Date(to), "MMM dd, yyyy")}`
      : `${format(defaultFrom, "MMM dd")} - ${format(defaultTo, "MMM dd, yyyy")}`;

  const { data, isLoading } = useGetSummary();

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DataCardLoading />
          <DataCardLoading />
          <DataCardLoading />
        </div>
        <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <AccountFilter />
          <DateFilter />
        </div>
        <DataChartsLoading />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
        <DataCard
          title="Remaining Balance"
          value={data?.remaining || 0}
          percentageChange={data?.remainingChange || 0}
          icon={PiggyBank}
          variant="default"
          dateRange={dateRangeLabel}
        />
        <DataCard
          title="Income"
          value={data?.income || 0}
          percentageChange={data?.incomeChange || 0}
          icon={TrendingUp}
          variant="success"
          dateRange={dateRangeLabel}
        />
        <DataCard
          title="Expenses"
          value={data?.expenses || 0}
          percentageChange={data?.expensesChange || 0}
          icon={TrendingDown}
          variant="danger"
          dateRange={dateRangeLabel}
        />
      </div>

      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <AccountFilter />
        <DateFilter />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <DataCharts data={data} />
      </div>
    </div>
  );
}
