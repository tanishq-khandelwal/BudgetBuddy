"use client";

import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import type { Report } from "@/features/reports/api/use-get-report";

const color = (i: number) => `hsl(var(--chart-${(i % 5) + 1}))`;

export const CategoryBreakdown = ({
  items,
}: {
  items: Report["categories"];
}) => {
  const { formatMiliunits } = useCurrency();
  const [selected, setSelected] = useState<string | null>(null);
  const config: ChartConfig = {};
  const dim = (name: string) => selected && selected !== name;

  return (
    <div className="grid items-center gap-6 md:grid-cols-[220px_1fr]">
      <ChartContainer
        config={config}
        className="mx-auto aspect-square w-full max-w-[220px]"
      >
        <PieChart>
          <Pie
            data={items}
            dataKey="amount"
            nameKey="name"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={items.length > 1 ? 2 : 0}
            strokeWidth={0}
            onClick={(d) => setSelected((s) => (s === d.name ? null : d.name))}
          >
            {items.map((c, i) => (
              <Cell
                key={c.name}
                fill={color(i)}
                opacity={dim(c.name) ? 0.25 : 1}
                className="cursor-pointer outline-none"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="space-y-1">
        {items.slice(0, 8).map((c, i) => (
          <li key={c.name}>
            <button
              type="button"
              aria-pressed={selected === c.name}
              onClick={() => setSelected((s) => (s === c.name ? null : c.name))}
              className={cn(
                "w-full rounded-lg px-2 py-2 text-left transition-opacity hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dim(c.name) && "opacity-40",
                selected === c.name && "bg-muted",
              )}
            >
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: color(i) }}
                  />
                  <span className="truncate font-medium">{c.name}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatMiliunits(c.amount)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {c.share.toFixed(0)}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.share}%`, background: color(i) }}
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
