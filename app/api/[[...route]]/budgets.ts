import { Hono } from "hono";
import { z } from "zod";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db/drizzle";
import {
  accounts,
  budgets,
  categories,
  insertBudgetSchema,
  transactions,
} from "@/db/schema";

const bodySchema = insertBudgetSchema.pick({ categoryId: true, amount: true });

const isUniqueViolation = (error: unknown) =>
  (error as { code?: string })?.code === "23505" ||
  (error as { cause?: { code?: string } })?.cause?.code === "23505";

const CONFLICT = "A budget for this category already exists.";

// Calendar-month bounds (UTC) for a yyyy-MM string.
const monthBounds = (month?: string) => {
  const now = new Date();
  const [y, m] = month
    ? month.split("-").map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
};

const ownsCategory = async (userId: string, categoryId: string) => {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  return !!row;
};

const app = new Hono()
  .get(
    "/",
    clerkMiddleware(),
    zValidator(
      "query",
      z.object({
        month: z
          .string()
          .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
          .optional(),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
      const { start, end } = monthBounds(c.req.valid("query").month);

      // Expenses in the month grouped by category (null = uncategorized).
      const spentRows = await db
        .select({
          categoryId: transactions.categoryId,
          spent: sql<number>`sum(abs(${transactions.amount}))`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            eq(accounts.userId, auth.userId),
            lt(transactions.amount, 0),
            gte(transactions.date, start),
            lt(transactions.date, end),
          ),
        )
        .groupBy(transactions.categoryId);

      const spentBy = new Map(spentRows.map((r) => [r.categoryId, r.spent]));

      const rows = await db
        .select({
          id: budgets.id,
          categoryId: budgets.categoryId,
          categoryName: categories.name,
          amount: budgets.amount,
        })
        .from(budgets)
        .innerJoin(categories, eq(budgets.categoryId, categories.id))
        .where(eq(budgets.userId, auth.userId));

      const budgeted = new Set(rows.map((r) => r.categoryId));
      const data = rows.map((r) => {
        const spent = spentBy.get(r.categoryId) ?? 0;
        return {
          ...r,
          spent,
          remaining: r.amount - spent,
          percentage: (spent / r.amount) * 100,
        };
      });

      const totalBudgeted = data.reduce((s, b) => s + b.amount, 0);
      const totalSpent = data.reduce((s, b) => s + b.spent, 0);
      const unbudgetedSpent = spentRows
        .filter((r) => !r.categoryId || !budgeted.has(r.categoryId))
        .reduce((s, r) => s + r.spent, 0);

      return c.json({
        data,
        totals: {
          budgeted: totalBudgeted,
          spent: totalSpent,
          remaining: totalBudgeted - totalSpent,
        },
        unbudgetedSpent,
      });
    },
  )
  .get(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
      const { id } = c.req.valid("param");

      const [data] = await db
        .select({
          id: budgets.id,
          categoryId: budgets.categoryId,
          amount: budgets.amount,
        })
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)));

      if (!data) return c.json({ error: "Budget not found" }, 404);
      return c.json({ data });
    },
  )
  .post("/", clerkMiddleware(), zValidator("json", bodySchema), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
    const values = c.req.valid("json");

    if (!(await ownsCategory(auth.userId, values.categoryId))) {
      return c.json({ error: "Category not found" }, 404);
    }

    try {
      const [data] = await db
        .insert(budgets)
        .values({ id: createId(), userId: auth.userId, ...values })
        .returning();
      return c.json({ data });
    } catch (error) {
      if (isUniqueViolation(error)) return c.json({ error: CONFLICT }, 409);
      throw error;
    }
  })
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
      const { ids } = c.req.valid("json");

      const data = await db
        .delete(budgets)
        .where(and(eq(budgets.userId, auth.userId), inArray(budgets.id, ids)))
        .returning({ id: budgets.id });
      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", bodySchema),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!(await ownsCategory(auth.userId, values.categoryId))) {
        return c.json({ error: "Category not found" }, 404);
      }

      try {
        const [data] = await db
          .update(budgets)
          .set(values)
          .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
          .returning();
        if (!data) return c.json({ error: "Budget not found" }, 404);
        return c.json({ data });
      } catch (error) {
        if (isUniqueViolation(error)) return c.json({ error: CONFLICT }, 409);
        throw error;
      }
    },
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
      const { id } = c.req.valid("param");

      const [data] = await db
        .delete(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
        .returning({ id: budgets.id });
      if (!data) return c.json({ error: "Budget not found" }, 404);
      return c.json({ data });
    },
  );

export default app;
