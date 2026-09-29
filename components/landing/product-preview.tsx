"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { useCurrency } from "@/hooks/use-currency";

const series = [
  { m: "Apr", v: 1800 },
  { m: "May", v: 2400 },
  { m: "Jun", v: 2100 },
  { m: "Jul", v: 3100 },
  { m: "Aug", v: 2800 },
  { m: "Sep", v: 3900 },
];

const budgets = [
  { name: "Groceries", spent: 420, limit: 600, color: "bg-chart-1" },
  { name: "Dining out", spent: 210, limit: 250, color: "bg-warning" },
  { name: "Transport", spent: 96, limit: 200, color: "bg-chart-2" },
];

const txns = [
  { payee: "Whole Foods", cat: "Groceries", amt: -64.2 },
  { payee: "Acme Payroll", cat: "Salary", amt: 3200 },
  { payee: "Netflix", cat: "Subscriptions", amt: -15.99 },
  { payee: "Shell", cat: "Transport", amt: -42.1 },
];

export const ProductPreview = () => {
  const { format } = useCurrency();
  const stats = [
    {
      label: "Income",
      value: 5400,
      icon: ArrowUpRight,
      tone: "text-success bg-success/10",
    },
    {
      label: "Expenses",
      value: 2130.5,
      icon: ArrowDownRight,
      tone: "text-destructive bg-destructive/10",
    },
    {
      label: "Balance",
      value: 3269.5,
      icon: Wallet,
      tone: "text-primary bg-primary/10",
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-border/50"
    >
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="mx-auto max-w-[220px] flex-1 truncate rounded-md bg-background px-3 py-1 text-center text-[11px] text-muted-foreground">
          budgetbuddy.app/dashboard
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border bg-background p-2.5 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {s.label}
                </span>
                <span
                  className={`hidden size-6 items-center justify-center rounded-md sm:flex ${s.tone}`}
                >
                  <s.icon className="size-3.5" />
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold tabular-nums tracking-tight sm:mt-2 sm:text-xl">
                {format(s.value, { maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-5">
          <div className="rounded-lg border bg-background p-3 sm:p-4 md:col-span-3">
            <p className="text-xs font-medium">Savings trend</p>
            <div className="mt-2 h-28 sm:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="lp-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="m"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#lp-fill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="hidden rounded-lg border bg-background p-4 md:col-span-2 md:block">
            <p className="text-xs font-medium">Budgets</p>
            <ul className="mt-3 space-y-3">
              {budgets.map((b) => (
                <li key={b.name}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span>{b.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {format(b.spent, { maximumFractionDigits: 0 })} /{" "}
                      {format(b.limit, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${(b.spent / b.limit) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden rounded-lg border bg-background sm:block">
          <p className="border-b px-4 py-2.5 text-xs font-medium">
            Recent transactions
          </p>
          <ul className="divide-y">
            {txns.map((t) => (
              <li
                key={t.payee}
                className="flex items-center justify-between px-4 py-2 text-xs"
              >
                <span className="font-medium">{t.payee}</span>
                <span className="text-muted-foreground">{t.cat}</span>
                <span
                  className={`tabular-nums ${t.amt > 0 ? "text-success" : ""}`}
                >
                  {format(t.amt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
