import { format } from "date-fns";
import type { Report } from "@/features/reports/api/use-get-report";

type Fmt = (miliunits: number) => string;

export const buildInsights = (r: Report, fmt: Fmt): string[] => {
  const { stats } = r;
  const out: string[] = [];
  const prev = stats.previousPeriod.expenses;

  if (prev > 0) {
    const change = ((stats.totalExpenses - prev) / prev) * 100;
    if (Math.abs(change) >= 1)
      out.push(
        `You spent ${Math.abs(change).toFixed(0)}% ${change < 0 ? "less" : "more"} than the previous period.`,
      );
  }
  const top = r.categories[0];
  if (top)
    out.push(
      `${top.name} is your top category at ${top.share.toFixed(0)}% of spending (${fmt(top.amount)}).`,
    );
  if (stats.totalIncome > 0)
    out.push(
      stats.savingsRate >= 0
        ? `Your savings rate is ${stats.savingsRate.toFixed(0)}%.`
        : `You spent ${fmt(-stats.net)} more than you earned in this period.`,
    );
  if (stats.largestExpense)
    out.push(
      `Largest expense: ${stats.largestExpense.payee}, ${fmt(stats.largestExpense.amount)} on ${format(new Date(stats.largestExpense.date), "MMM d")}.`,
    );
  if (stats.avgDailyExpenses > 0)
    out.push(
      `You spend about ${fmt(stats.avgDailyExpenses)} per day on average.`,
    );
  return out.slice(0, 5);
};
