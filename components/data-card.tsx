"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import CountUp from "react-countup";
import { Area, AreaChart, YAxis } from "recharts";
import { useId } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, convertAmountFromMiliunits } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

type Props = {
  title: string;
  /** Miliunits for currency cards, or a plain percentage for `percent`. */
  value?: number;
  percentageChange?: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning";
  dateRange: string;
  kind?: "currency" | "percent";
  /** Daily values (any unit) for the sparkline. */
  series?: number[];
  /** When true an increase is bad (e.g. expenses). */
  invertChange?: boolean;
};

const tone = {
  default: {
    icon: "bg-primary/10 text-primary",
    stroke: "hsl(var(--chart-1))",
  },
  success: {
    icon: "bg-success/10 text-success",
    stroke: "hsl(var(--success))",
  },
  danger: {
    icon: "bg-destructive/10 text-destructive",
    stroke: "hsl(var(--destructive))",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    stroke: "hsl(var(--warning))",
  },
};

const Sparkline = ({
  series,
  stroke,
}: {
  series: number[];
  stroke: string;
}) => {
  const id = useId().replace(/:/g, "");
  const data = series.map((v, i) => ({ i, v }));
  return (
    <AreaChart
      width={96}
      height={40}
      data={data}
      margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <YAxis hide domain={["dataMin", "dataMax"]} />
      <Area
        type="monotone"
        dataKey="v"
        stroke={stroke}
        strokeWidth={1.5}
        fill={`url(#${id})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  );
};

export const DataCard = ({
  title,
  value = 0,
  percentageChange = 0,
  icon: Icon,
  variant = "default",
  dateRange,
  kind = "currency",
  series,
  invertChange = false,
}: Props) => {
  const { format } = useCurrency();
  const isPercent = kind === "percent";
  const end = isPercent ? value : convertAmountFromMiliunits(value);
  const good = invertChange ? percentageChange < 0 : percentageChange > 0;

  return (
    <Card className="group p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone[variant].icon,
          )}
        >
          <Icon className="size-[18px]" />
        </div>
      </div>
      <div
        className="mt-3 truncate text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]"
        aria-label={`${title}: ${isPercent ? `${end.toFixed(1)}%` : format(end)}`}
      >
        <CountUp
          duration={1}
          preserveValue
          end={end}
          decimals={2}
          formattingFn={(v) => (isPercent ? `${v.toFixed(1)}%` : format(v))}
        />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          {percentageChange !== 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                good
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {percentageChange > 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              No change
            </span>
          )}
          <p className="truncate text-xs text-muted-foreground">
            vs previous period · {dateRange}
          </p>
        </div>
        {series && series.length > 1 && (
          <div className="shrink-0">
            <Sparkline series={series} stroke={tone[variant].stroke} />
          </div>
        )}
      </div>
    </Card>
  );
};

export const DataCardLoading = () => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="size-9 rounded-lg" />
    </div>
    <Skeleton className="mt-3 h-8 w-32" />
    <div className="mt-3 flex items-end justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  </Card>
);
