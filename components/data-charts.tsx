import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { FileBarChart, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  data?: {
    days: { date: Date; income: number; expenses: number }[];
  };
};

export const DataCharts = ({ data }: Props) => {
  const chartData =
    data?.days?.map((day) => ({
      date: format(new Date(day.date), "MMM dd"),
      income: convertAmountFromMiliunits(day.income),
      expenses: convertAmountFromMiliunits(day.expenses),
    })) || [];

  const chartConfig = {
    income: {
      label: "Income",
      color: "#10b981",
    },
    expenses: {
      label: "Expenses",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      {/* Area Chart - Income vs Expenses */}
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Income vs Expenses</CardTitle>
              <CardDescription>Daily transaction overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
              <FileBarChart className="size-12 mb-2 text-gray-300" />
              <p className="text-sm">No data available for this period</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#income)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#expenses)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const DataChartsLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
};
