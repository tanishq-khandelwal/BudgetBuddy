"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import type { Summary } from "@/features/summary/api/use-get-summary";

const chartConfig = {
  income: { label: "Income", color: "hsl(var(--success))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const dayLabel = (d: string) =>
  format(parse(d, "yyyy-MM-dd", new Date()), "MMM d");

export const IncomeExpenseChart = ({ data }: { data: Summary }) => {
  const [type, setType] = useState<"area" | "bar">("area");
  const { format: money } = useCurrency();

  const rows = data.days.map((d) => ({
    date: String(d.date),
    income: convertAmountFromMiliunits(d.income),
    expenses: convertAmountFromMiliunits(d.expenses),
  }));

  const compact = (v: number) =>
    money(v, { notation: "compact", maximumFractionDigits: 1 });

  const common = {
    data: rows,
    margin: { top: 8, right: 4, bottom: 0, left: 0 },
  };

  const axes = (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={32}
        tickFormatter={dayLabel}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={48}
        tickFormatter={compact}
      />
      <ChartTooltip
        cursor={{ strokeDasharray: "3 3" }}
        content={
          <ChartTooltipContent
            labelFormatter={(_, payload) =>
              payload?.[0]
                ? format(
                    parse(payload[0].payload.date, "yyyy-MM-dd", new Date()),
                    "EEE, MMM d, yyyy",
                  )
                : ""
            }
            formatter={(value, name) => (
              <div className="flex w-full items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: `var(--color-${name})` }}
                  />
                  {chartConfig[name as keyof typeof chartConfig]?.label}
                </span>
                <span className="font-medium tabular-nums">
                  {money(Number(value))}
                </span>
              </div>
            )}
          />
        }
      />
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Income vs expenses</CardTitle>
          <CardDescription>
            Daily activity for the selected period
          </CardDescription>
        </div>
        <ToggleGroup
          type="single"
          value={type}
          onValueChange={(v) => v && setType(v as "area" | "bar")}
          variant="outline"
          size="sm"
          aria-label="Chart type"
        >
          <ToggleGroupItem value="area" className="h-10 px-4 sm:h-9">
            Area
          </ToggleGroupItem>
          <ToggleGroupItem value="bar" className="h-10 px-4 sm:h-9">
            Bar
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[240px] w-full sm:h-[320px]"
        >
          {type === "area" ? (
            <AreaChart {...common}>
              <defs>
                {(["income", "expenses"] as const).map((k) => (
                  <linearGradient
                    key={k}
                    id={`fill-${k}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${k})`}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${k})`}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              {axes}
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={2}
                fill="url(#fill-income)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                fill="url(#fill-expenses)"
              />
            </AreaChart>
          ) : (
            <BarChart {...common} barGap={2}>
              {axes}
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="expenses"
                fill="var(--color-expenses)"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const COLORS = [1, 2, 3, 4, 5].map((n) => `hsl(var(--chart-${n}))`);
// "Other" bucket is neutral so it never competes with real categories.
const colorFor = (name: string, i: number) =>
  name === "Other"
    ? "hsl(var(--muted-foreground) / 0.5)"
    : COLORS[i % COLORS.length];

export const CategoryChart = ({ data }: { data: Summary }) => {
  const { formatMiliunits } = useCurrency();
  const items = data.categoryBreakdown;
  const total = items.reduce((t, c) => t + c.value, 0);

  const config: ChartConfig = Object.fromEntries(
    items.map((c, i) => [
      c.name,
      { label: c.name, color: colorFor(c.name, i) },
    ]),
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Spending by category</CardTitle>
        <CardDescription>Where your money went</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <PieIcon className="size-8 opacity-40" />
            No expenses in this period
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="relative mx-auto size-[180px]">
              <ChartContainer
                config={config}
                className="aspect-square size-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-6">
                            <span className="text-muted-foreground">
                              {name}
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatMiliunits(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={items}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {items.map((c, i) => (
                      <Cell key={c.name} fill={colorFor(c.name, i)} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="max-w-[100px] truncate text-sm font-semibold tabular-nums">
                  {formatMiliunits(total, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })}
                </span>
              </div>
            </div>
            <ul className="space-y-1">
              {items.map((c, i) => (
                <li
                  key={c.name}
                  className="flex min-h-9 items-center gap-3 text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: colorFor(c.name, i) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {total ? Math.round((c.value / total) * 100) : 0}%
                  </span>
                  <span className="w-24 text-right font-medium tabular-nums">
                    {formatMiliunits(c.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DataChartsLoading = () => (
  <>
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[240px] w-full sm:h-[320px]" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="mx-auto size-[180px] rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  </>
);
