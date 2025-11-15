import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { transactions, accounts } from "@/db/schema";
import { parse, subDays, differenceInDays } from "date-fns";
import { and, eq, gte, lte, desc, sql, sum } from "drizzle-orm";
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
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;

    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

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

      // Get top categories
      const categories = await db
        .select({
          name: sql`COALESCE(categories.name, 'Uncategorized')`.as("name"),
          value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(
          sql`categories`,
          sql`${transactions.categoryId} = categories.id`,
        )
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            sql`${transactions.amount} < 0`,
          ),
        )
        .groupBy(sql`categories.name`)
        .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`))
        .limit(5);

      // Get daily data for chart
      const days = await db
        .select({
          date: transactions.date,
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
        )
        .groupBy(transactions.date)
        .orderBy(transactions.date);

      return c.json({
        data: {
          income: currentIncome,
          expenses: currentExpenses,
          remaining: currentRemaining,
          incomeChange,
          expensesChange,
          remainingChange,
          categories,
          days,
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
