import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  accounts,
  budgets,
  categories,
  recurringTransactions,
  transactions,
  userSettings,
} from "@/db/schema";
import { count, eq, inArray } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

const DEFAULT_SETTINGS = { currency: "USD" };

const userAccountIds = (userId: string) =>
  db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

const app = new Hono()
  .get("/stats", clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const n = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;
    const [a, cat, t, b, r] = await Promise.all([
      n(
        db
          .select({ n: count() })
          .from(accounts)
          .where(eq(accounts.userId, userId)),
      ),
      n(
        db
          .select({ n: count() })
          .from(categories)
          .where(eq(categories.userId, userId)),
      ),
      n(
        db
          .select({ n: count() })
          .from(transactions)
          .where(inArray(transactions.accountId, userAccountIds(userId))),
      ),
      n(
        db
          .select({ n: count() })
          .from(budgets)
          .where(eq(budgets.userId, userId)),
      ),
      n(
        db
          .select({ n: count() })
          .from(recurringTransactions)
          .where(eq(recurringTransactions.userId, userId)),
      ),
    ]);
    return c.json({
      data: {
        accounts: a,
        categories: cat,
        transactions: t,
        budgets: b,
        recurring: r,
      },
    });
  })
  .get("/export", clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const [settings, accs, cats, txs, buds, rec] = await Promise.all([
      db.select().from(userSettings).where(eq(userSettings.userId, userId)),
      db.select().from(accounts).where(eq(accounts.userId, userId)),
      db.select().from(categories).where(eq(categories.userId, userId)),
      db
        .select()
        .from(transactions)
        .where(inArray(transactions.accountId, userAccountIds(userId))),
      db.select().from(budgets).where(eq(budgets.userId, userId)),
      db
        .select()
        .from(recurringTransactions)
        .where(eq(recurringTransactions.userId, userId)),
    ]);
    return c.json({
      exportedAt: new Date().toISOString(),
      note: "All amounts are integers in miliunits (1.00 = 1000). Negative = expense, positive = income.",
      settings: settings[0] ?? DEFAULT_SETTINGS,
      accounts: accs,
      categories: cats,
      transactions: txs,
      budgets: buds,
      recurring: rec,
    });
  })
  .delete("/data", clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const idOnly = { id: recurringTransactions.id };
    const txIds = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(inArray(transactions.accountId, userAccountIds(userId)));
    // Order: recurring + budgets first, then accounts (cascades transactions), then categories.
    const rec = await db
      .delete(recurringTransactions)
      .where(eq(recurringTransactions.userId, userId))
      .returning(idOnly);
    const buds = await db
      .delete(budgets)
      .where(eq(budgets.userId, userId))
      .returning({ id: budgets.id });
    const accs = await db
      .delete(accounts)
      .where(eq(accounts.userId, userId))
      .returning({ id: accounts.id });
    const cats = await db
      .delete(categories)
      .where(eq(categories.userId, userId))
      .returning({ id: categories.id });

    return c.json({
      data: {
        accounts: accs.length,
        categories: cats.length,
        transactions: txIds.length,
        budgets: buds.length,
        recurring: rec.length,
      },
    });
  })
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [row] = await db
      .select({ currency: userSettings.currency })
      .from(userSettings)
      .where(eq(userSettings.userId, auth.userId));

    return c.json({ data: row ?? DEFAULT_SETTINGS });
  })
  .patch(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        currency: z.enum(
          SUPPORTED_CURRENCIES.map((c) => c.code) as [string, ...string[]],
        ),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const values = c.req.valid("json");

      const [data] = await db
        .insert(userSettings)
        .values({ userId: auth.userId, ...values })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: { ...values, updatedAt: new Date() },
        })
        .returning({ currency: userSettings.currency });

      return c.json({ data });
    },
  );

export default app;
