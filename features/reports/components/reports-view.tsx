"use client";

import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import {
  useGetReport,
  type Report,
} from "@/features/reports/api/use-get-report";
import { resolveRange } from "@/features/reports/lib/range";
import { CashFlowChart } from "./cash-flow-chart";
import { CategoryBreakdown } from "./category-breakdown";
import { ExportMenu } from "./export-menu";
import { ReportControls } from "./report-controls";
import { buildInsights } from "./insights";

const pctChange = (now: number, before: number) =>
  before === 0
    ? now === 0
      ? 0
      : null
    : ((now - before) / Math.abs(before)) * 100;

const Kpi = ({
  label,
  value,
  change,
  goodWhenUp,
  suffix = "vs previous period",
}: {
  label: string;
  value: string;
  change: number | null;
  goodWhenUp: boolean;
  suffix?: string;
}) => {
  const pts = suffix.startsWith("pts");
  const flat = change === 0;
  const good = change !== null && change > 0 === goodWhenUp;
  const Icon =
    flat || change === null
      ? Minus
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs text-muted-foreground",
            !flat &&
              change !== null &&
              (good ? "text-success" : "text-destructive"),
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="font-medium">
            {change === null
              ? "New"
              : `${Math.abs(change).toFixed(1)}${pts ? "" : "%"}`}
          </span>
          <span className="text-muted-foreground">{suffix}</span>
        </p>
      </CardContent>
    </Card>
  );
};

const Section = ({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <Card className={cn("print:break-inside-avoid print:shadow-none", className)}>
    <CardHeader className="pb-4">
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Muted = ({ children }: { children: React.ReactNode }) => (
  <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
);

const RankRow = ({
  primary,
  secondary,
  amount,
  rank,
}: {
  primary: string;
  secondary: string;
  amount: string;
  rank?: number;
}) => (
  <li className="flex items-center gap-3 py-2.5 text-sm">
    {rank !== undefined && (
      <span className="w-5 text-xs tabular-nums text-muted-foreground">
        {rank}
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate font-medium">{primary}</span>
      <span className="block text-xs text-muted-foreground">{secondary}</span>
    </span>
    <span className="tabular-nums">{amount}</span>
  </li>
);

const Body = ({ data }: { data: Report }) => {
  const { formatMiliunits: fm } = useCurrency();
  const { stats } = data;
  const prev = stats.previousPeriod;
  const prevNet = prev.income - prev.expenses;
  const prevRate =
    prev.income > 0 ? ((prev.income - prev.expenses) / prev.income) * 100 : 0;
  const insights = buildInsights(data, fm);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total income"
          value={fm(stats.totalIncome)}
          change={pctChange(stats.totalIncome, prev.income)}
          goodWhenUp
        />
        <Kpi
          label="Total expenses"
          value={fm(stats.totalExpenses)}
          change={pctChange(stats.totalExpenses, prev.expenses)}
          goodWhenUp={false}
        />
        <Kpi
          label="Net savings"
          value={fm(stats.net)}
          change={pctChange(stats.net, prevNet)}
          goodWhenUp
        />
        <Kpi
          label="Savings rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          change={stats.savingsRate - prevRate}
          goodWhenUp
          suffix="pts vs previous period"
        />
      </div>

      <Section
        title="Cash flow"
        description="Income and expenses by month, with net savings"
      >
        <CashFlowChart monthly={data.monthly} />
      </Section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Section
          title="Spending by category"
          description="Select a category to highlight it"
          className="lg:col-span-2"
        >
          {data.categories.length ? (
            <CategoryBreakdown items={data.categories} />
          ) : (
            <Muted>No expenses in this period.</Muted>
          )}
        </Section>

        <Section title="Insights">
          {insights.length ? (
            <ul className="space-y-3">
              {insights.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed">
                  <Lightbulb
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Not enough data yet.</Muted>
          )}
        </Section>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Section title="Top payees" description="Where most of your money goes">
          {data.topPayees.length ? (
            <ol className="divide-y">
              {data.topPayees.map((p, i) => (
                <RankRow
                  key={p.payee}
                  rank={i + 1}
                  primary={p.payee}
                  secondary={`${p.count} transaction${p.count === 1 ? "" : "s"}`}
                  amount={fm(p.amount)}
                />
              ))}
            </ol>
          ) : (
            <Muted>No expenses in this period.</Muted>
          )}
        </Section>

        <Section title="Income sources">
          {data.incomeSources.length ? (
            <ul className="divide-y">
              {data.incomeSources.slice(0, 6).map((s) => (
                <RankRow
                  key={s.name}
                  primary={s.name}
                  secondary={`${s.share.toFixed(0)}% of income`}
                  amount={fm(s.amount)}
                />
              ))}
            </ul>
          ) : (
            <Muted>No income in this period.</Muted>
          )}
        </Section>

        <Section title="Accounts">
          <ul className="divide-y">
            {data.accounts.map((a) => (
              <li key={a.name} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">{a.name}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      a.net < 0 ? "text-destructive" : "text-success",
                    )}
                  >
                    {fm(a.net)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {fm(a.income)} in · {fm(a.expenses)} out
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
};

const Loading = () => (
  <div
    className="space-y-4 sm:space-y-6"
    aria-busy="true"
    aria-label="Loading report"
  >
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[120px] rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[400px] rounded-xl" />
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[280px] rounded-xl" />
      ))}
    </div>
  </div>
);

export const ReportsView = () => {
  const params = useSearchParams();
  const { from, to } = resolveRange(params.get("from"), params.get("to"));
  const accountId = params.get("accountId") || undefined;
  const { data, isLoading, isError, refetch, isFetching } = useGetReport();

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${format(new Date(`${from}T00:00`), "MMM d, yyyy")} – ${format(new Date(`${to}T00:00`), "MMM d, yyyy")}`}
        actions={
          <>
            <ReportControls />
            <ExportMenu
              report={data}
              from={from}
              to={to}
              accountId={accountId}
            />
          </>
        }
      />
      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load your report"
          description="Something went wrong while fetching your data."
          action={
            <Button onClick={() => refetch()} disabled={isFetching}>
              Try again
            </Button>
          }
        />
      ) : isLoading || !data ? (
        <Loading />
      ) : data.stats.transactionCount === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No transactions in this period"
          description="Try a longer period or a different account to see your reports."
        />
      ) : (
        <Body data={data} />
      )}
    </>
  );
};
