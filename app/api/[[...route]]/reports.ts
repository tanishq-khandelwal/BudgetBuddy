import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { transactions, accounts, categories } from "@/db/schema";
import {
  parse,
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfDay,
  startOfDay,
  differenceInCalendarDays,
  eachMonthOfInterval,
  isValid,
} from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";

const income =
  sql`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(
    Number,
  );
const expenses =
  sql`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN -${transactions.amount} ELSE 0 END), 0)`.mapWith(
    Number,
  );
const count = sql`COUNT(*)`.mapWith(Number);

const pct = (part: number, total: number) =>
  total > 0 ? (part / total) * 100 : 0;

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    }),
  ),
  clerkMiddleware(),
  async (c) => {
    const auth = getAuth(c);
    const { from, to, accountId } = c.req.valid("query");

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = auth.userId;

    const today = new Date();
    const parsedFrom = from ? parse(from, "yyyy-MM-dd", new Date()) : null;
    const parsedTo = to ? parse(to, "yyyy-MM-dd", new Date()) : null;
    if (
      (parsedFrom && !isValid(parsedFrom)) ||
      (parsedTo && !isValid(parsedTo))
    ) {
      return c.json({ error: "Invalid date" }, 400);
    }

    const endDate = endOfDay(parsedTo ?? today);
    const startDate = startOfDay(
      parsedFrom ?? startOfMonth(subMonths(endDate, 11)),
    );
    if (startDate > endDate) {
      return c.json({ error: "`from` must be before `to`" }, 400);
    }

    const days = differenceInCalendarDays(endDate, startDate) + 1;
    const prevEnd = endOfDay(subDays(startDate, 1));
    const prevStart = startOfDay(subDays(startDate, days));

    const scope = (a: Date, b: Date) =>
      and(
        accountId ? eq(transactions.accountId, accountId) : undefined,
        eq(accounts.userId, userId),
        gte(transactions.date, a),
        lte(transactions.date, b),
      );
    const where = scope(startDate, endDate);
    const categoryName = sql<string>`COALESCE(${categories.name}, 'Uncategorized')`;
    const month = sql<string>`to_char(date_trunc('month', ${transactions.date}), 'YYYY-MM')`;

    try {
      const [monthlyRows, categoryRows, payeeRows, accountRows, largest, prev] =
        await Promise.all([
          db
            .select({ month, income, expenses })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(where)
            .groupBy(month),
          db
            .select({
              name: categoryName,
              isExpense: sql<boolean>`${transactions.amount} < 0`,
              amount: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
              count,
            })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(where)
            .groupBy(categoryName, sql`${transactions.amount} < 0`),
          db
            .select({ payee: transactions.payee, amount: expenses, count })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(and(where, sql`${transactions.amount} < 0`))
            .groupBy(transactions.payee)
            .orderBy(sql`2 DESC`)
            .limit(10),
          db
            .select({ id: accounts.id, name: accounts.name, income, expenses })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(where)
            .groupBy(accounts.id, accounts.name),
          db
            .select({
              payee: transactions.payee,
              amount: sql<number>`-${transactions.amount}`,
              date: transactions.date,
            })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(and(where, sql`${transactions.amount} < 0`))
            .orderBy(transactions.amount)
            .limit(1),
          db
            .select({ income, expenses })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(scope(prevStart, prevEnd)),
        ]);

      const byMonth = new Map(monthlyRows.map((r) => [r.month, r]));
      const monthly = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      }).map((d) => {
        const key = format(d, "yyyy-MM");
        const r = byMonth.get(key);
        const inc = r?.income ?? 0;
        const exp = r?.expenses ?? 0;
        return { month: key, income: inc, expenses: exp, net: inc - exp };
      });

      const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
      const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
      const net = totalIncome - totalExpenses;

      const breakdown = (isExpense: boolean, total: number) =>
        categoryRows
          .filter((r) => !!r.isExpense === isExpense)
          .map((r) => ({
            name: r.name,
            amount: r.amount,
            share: pct(r.amount, total),
            count: r.count,
          }))
          .sort((a, b) => b.amount - a.amount);

      return c.json({
        data: {
          range: {
            from: format(startDate, "yyyy-MM-dd"),
            to: format(endDate, "yyyy-MM-dd"),
          },
          monthly,
          categories: breakdown(true, totalExpenses),
          incomeSources: breakdown(false, totalIncome),
          topPayees: payeeRows,
          accounts: accountRows
            .map((r) => ({
              name: r.name,
              income: r.income,
              expenses: r.expenses,
              net: r.income - r.expenses,
            }))
            .sort((a, b) => b.income + b.expenses - (a.income + a.expenses)),
          stats: {
            totalIncome,
            totalExpenses,
            net,
            savingsRate: pct(net, totalIncome),
            avgMonthlyExpenses: totalExpenses / Math.max(monthly.length, 1),
            avgDailyExpenses: totalExpenses / days,
            transactionCount: categoryRows.reduce((s, r) => s + r.count, 0),
            largestExpense: largest[0]
              ? {
                  payee: largest[0].payee,
                  amount: Number(largest[0].amount),
                  date: largest[0].date.toISOString(),
                }
              : null,
            previousPeriod: {
              income: prev[0]?.income ?? 0,
              expenses: prev[0]?.expenses ?? 0,
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to fetch report:", error);
      return c.json({ error: "Failed to fetch report" }, 500);
    }
  },
);

export default app;
