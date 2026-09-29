import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { transactions, accounts, categories } from "@/db/schema";
import {
  parse,
  subDays,
  differenceInDays,
  startOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";

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

    const defaultTo = new Date();
    const defaultFrom = startOfMonth(defaultTo);

    const startDate = startOfDay(
      from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom,
    );

    const endDate = endOfDay(
      to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo,
    );

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return c.json({ error: "Invalid date" }, 400);
    }

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);
    const inRange = and(
      accountId ? eq(transactions.accountId, accountId) : undefined,
      eq(accounts.userId, auth.userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
    );

    try {
      // Get current period data
      const currentPeriod = await db
        .select({
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number,
            ),
          expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
              Number,
            ),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        );

      // Get last period data for comparison
      const lastPeriod = await db
        .select({
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number,
            ),
          expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
              Number,
            ),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, lastPeriodStart),
            lte(transactions.date, lastPeriodEnd),
          ),
        );

      const currentIncome = currentPeriod[0]?.income || 0;
      const currentExpenses = currentPeriod[0]?.expenses || 0;
      const lastIncome = lastPeriod[0]?.income || 0;
      const lastExpenses = lastPeriod[0]?.expenses || 0;

      const incomeChange =
        lastIncome !== 0
          ? ((currentIncome - lastIncome) / lastIncome) * 100
          : currentIncome > 0
            ? 100
            : 0;

      const expensesChange =
        lastExpenses !== 0
          ? ((currentExpenses - lastExpenses) / lastExpenses) * 100
          : currentExpenses > 0
            ? 100
            : 0;

      const currentRemaining = currentIncome - currentExpenses;
      const lastRemaining = lastIncome - lastExpenses;

      const remainingChange =
        lastRemaining !== 0
          ? ((currentRemaining - lastRemaining) / Math.abs(lastRemaining)) * 100
          : currentRemaining > 0
            ? 100
            : 0;

      const categoryRows = await db
        .select({
          name: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
          value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(inRange, sql`${transactions.amount} < 0`))
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));

      const topCategories = categoryRows.slice(0, 5);
      const otherValue = categoryRows
        .slice(5)
        .reduce((total, row) => total + row.value, 0);
      const categoryBreakdown =
        otherValue > 0
          ? [...topCategories, { name: "Other", value: otherValue }]
          : topCategories;

      const dayRows = await db
        .select({
          date: sql<string>`to_char(${transactions.date}, 'YYYY-MM-DD')`,
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number,
            ),
          expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
              Number,
            ),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(inRange)
        .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM-DD')`);

      // Fill days with no activity so charts are continuous.
      const byDay = new Map(dayRows.map((row) => [row.date, row]));
      const days = eachDayOfInterval({ start: startDate, end: endDate }).map(
        (day) => {
          const key = format(day, "yyyy-MM-dd");
          const row = byDay.get(key);
          return {
            date: key,
            income: row?.income ?? 0,
            expenses: row?.expenses ?? 0,
          };
        },
      );

      const recentTransactions = await db
        .select({
          id: transactions.id,
          payee: transactions.payee,
          amount: transactions.amount,
          date: transactions.date,
          category: categories.name,
          account: accounts.name,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(inRange)
        .orderBy(desc(transactions.date))
        .limit(6);

      return c.json({
        data: {
          income: currentIncome,
          expenses: currentExpenses,
          remaining: currentRemaining,
          incomeChange,
          expensesChange,
          remainingChange,
          categories: topCategories,
          categoryBreakdown,
          days,
          recentTransactions,
        },
      });
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      return c.json(
        {
          error: "Failed to fetch summary",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  },
);

export default app;
