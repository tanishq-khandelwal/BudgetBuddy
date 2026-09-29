"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useCurrency } from "@/hooks/use-currency";
import { parse, format } from "date-fns";
import type { Report } from "@/features/reports/api/use-get-report";

const config = {
  income: { label: "Income", color: "hsl(var(--success))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
  net: { label: "Net", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export const CashFlowChart = ({ monthly }: { monthly: Report["monthly"] }) => {
  const { format: fmt, formatMiliunits } = useCurrency();
  const long = monthly.length > 12;
  const label = (m: string) =>
    format(parse(m, "yyyy-MM", new Date()), long ? "MMM yy" : "MMM");

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[260px] w-full sm:h-[320px]"
    >
      <ComposedChart data={monthly} margin={{ left: 0, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
          tickFormatter={label}
        />
        <YAxis
          width={44}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            fmt(v / 1000, { notation: "compact", maximumFractionDigits: 1 })
          }
        />
        <ChartTooltip
          cursor={{ fillOpacity: 0.4 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, p) => (p[0] ? label(p[0].payload.month) : "")}
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ background: item.color }}
                    />
                    {config[name as keyof typeof config]?.label}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatMiliunits(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="expenses"
          fill="var(--color-expenses)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Line
          dataKey="net"
          type="monotone"
          stroke="var(--color-net)"
          strokeWidth={2}
          dot={monthly.length <= 12}
        />
      </ComposedChart>
    </ChartContainer>
  );
};
