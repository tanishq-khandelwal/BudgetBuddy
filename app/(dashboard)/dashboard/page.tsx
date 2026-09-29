"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { format, parse, startOfMonth } from "date-fns";
import {
  AlertCircle,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Percent,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/data-card";
import { CategoryChart, IncomeExpenseChart } from "@/components/data-charts";
import { DateFilter } from "@/components/date-filter";
import { AccountFilter } from "@/components/account-filter";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { BudgetOverviewWidget } from "@/features/budgets/components/budget-overview-widget";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const rangeLabel = (from: string | null, to: string | null) => {
  const today = new Date();
  const f = from ? parse(from, "yyyy-MM-dd", today) : startOfMonth(today);
  const t = to ? parse(to, "yyyy-MM-dd", today) : today;
  return `${format(f, "MMM d")} – ${format(t, "MMM d")}`;
};

const rate = (income: number, expenses: number) =>
  income > 0 ? ((income - expenses) / income) * 100 : 0;

export default function DashboardPage() {
  const params = useSearchParams();
  const { user } = useUser();
  const onNewTransaction = useNewTransaction((s) => s.onOpen);
  const { data, isLoading, isError, refetch, isFetching } = useGetSummary();

  const name = user?.firstName;
  const header = (
    <PageHeader
      title={name ? `${greeting()}, ${name}` : greeting()}
      description="Here's how your money is moving."
      actions={
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
          <AccountFilter />
          <DateFilter />
        </div>
      }
    />
  );

  if (isLoading) {
    return (
      <>
        {header}
        <DashboardLoading />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        {header}
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your dashboard"
          description="Something went wrong while fetching your summary."
          action={
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Retrying…" : "Try again"}
            </Button>
          }
        />
      </>
    );
  }

  const isEmpty =
    data.recentTransactions.length === 0 &&
    data.income === 0 &&
    data.expenses === 0;

  if (isEmpty) {
    return (
      <>
        {header}
        <EmptyState
          icon={LayoutDashboard}
          title="No transactions yet"
          description="Add your first transaction or import a CSV to see your income, spending and trends here. Try a different date range if you expected data."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={onNewTransaction}>
                <Plus className="mr-2 size-4" /> Add transaction
              </Button>
              <Button variant="outline" asChild>
                <Link href="/transactions">
                  <Upload className="mr-2 size-4" /> Import CSV
                </Link>
              </Button>
            </div>
          }
        />
      </>
    );
  }

  const label = rangeLabel(params.get("from"), params.get("to"));
  const savings = rate(data.income, data.expenses);
  const running = data.days.reduce<number[]>((acc, d) => {
    acc.push((acc.at(-1) ?? 0) + d.income - d.expenses);
    return acc;
  }, []);

  return (
    <>
      {header}
      <div className="animate-slide-up space-y-4 motion-reduce:animate-none sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DataCard
            title="Balance"
            value={data.remaining}
            percentageChange={data.remainingChange}
            icon={PiggyBank}
            dateRange={label}
            series={running}
          />
          <DataCard
            title="Income"
            value={data.income}
            percentageChange={data.incomeChange}
            icon={TrendingUp}
            variant="success"
            dateRange={label}
            series={data.days.map((d) => d.income)}
          />
          <DataCard
            title="Expenses"
            value={data.expenses}
            percentageChange={data.expensesChange}
            icon={TrendingDown}
            variant="danger"
            invertChange
            dateRange={label}
            series={data.days.map((d) => d.expenses)}
          />
          <DataCard
            title="Savings rate"
            kind="percent"
            value={savings}
            icon={Percent}
            variant="warning"
            dateRange={label}
            series={data.days.map((d) => d.income - d.expenses)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <IncomeExpenseChart data={data} />
          </div>
          <div className="min-w-0">
            <CategoryChart data={data} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="min-w-0 lg:col-span-2 lg:has-[+div:not(:empty)]:col-span-1">
            <RecentTransactions data={data} />
          </div>
          <div className="min-w-0 empty:hidden">
            <BudgetOverviewWidget />
          </div>
        </div>
      </div>
    </>
  );
}
