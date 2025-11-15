import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn, convertAmountFromMiliunits } from "@/lib/utils";
import CountUp from "react-countup";

type Props = {
  title: string;
  value?: number;
  percentageChange?: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning";
  dateRange: string;
};

export const DataCard = ({
  title,
  value = 0,
  percentageChange = 0,
  icon: Icon,
  variant = "default",
  dateRange,
}: Props) => {
  const variantStyles = {
    default: "bg-gradient-to-br from-blue-500 to-blue-600",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    danger: "bg-gradient-to-br from-rose-500 to-rose-600",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600",
  };

  const variantAccents = {
    default: "text-blue-600 bg-blue-100",
    success: "text-emerald-600 bg-emerald-100",
    danger: "text-rose-600 bg-rose-100",
    warning: "text-amber-600 bg-amber-100",
  };

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between gap-x-4 pb-2">
        <div className="space-y-2">
          <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-x-2">
            <div className="text-3xl font-bold text-gray-900">
              <CountUp
                duration={1.5}
                preserveValue
                end={convertAmountFromMiliunits(value)}
                decimals={2}
                decimalPlaces={2}
                prefix="$"
                formattingFn={(value) => {
                  return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value);
                }}
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110",
            variantStyles[variant],
          )}
        >
          <Icon className="size-6 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500 text-xs">{dateRange}</p>
          {percentageChange !== 0 && (
            <div
              className={cn(
                "flex items-center gap-x-1 px-2 py-1 rounded-full text-xs font-semibold",
                percentageChange > 0
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-rose-700 bg-rose-100",
              )}
            >
              {percentageChange > 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>{Math.abs(percentageChange).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className="bg-white border-2 border-gray-200 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-16 w-16 rounded-2xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
};
