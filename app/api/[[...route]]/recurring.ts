import { Hono } from "hono";
import { z } from "zod";
import { and, asc, eq, lte } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { endOfDay } from "date-fns";
import { db } from "@/db/drizzle";
import {
  accounts,
  categories,
  recurringTransactions as rules,
  RECURRING_FREQUENCIES,
  transactions,
} from "@/db/schema";
import {
  firstOccurrenceFrom,
  getDueOccurrences,
  nextOccurrences,
} from "@/lib/recurring";

const bodySchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  payee: z.string().trim().min(1),
  amount: z
    .number()
    .int()
    .refine((n) => n !== 0, "Amount cannot be zero"),
  notes: z.string().nullable().optional(),
  frequency: z.enum(RECURRING_FREQUENCIES),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

const idParam = zValidator("param", z.object({ id: z.string() }));

// Account and category must belong to the caller.
const ownsRefs = async (
  userId: string,
  accountId: string,
  categoryId?: string | null,
) => {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
  if (!account) return false;
  if (!categoryId) return true;
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  return !!category;
};

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const rows = await db
      .select({
        id: rules.id,
        accountId: rules.accountId,
        account: accounts.name,
        categoryId: rules.categoryId,
        category: categories.name,
        payee: rules.payee,
        amount: rules.amount,
        notes: rules.notes,
        frequency: rules.frequency,
        startDate: rules.startDate,
        nextDate: rules.nextDate,
        endDate: rules.endDate,
        isActive: rules.isActive,
      })
      .from(rules)
      .innerJoin(accounts, eq(rules.accountId, accounts.id))
      .leftJoin(categories, eq(rules.categoryId, categories.id))
      .where(eq(rules.userId, userId))
      .orderBy(asc(rules.nextDate));

    const data = rows.map((r) => ({
      ...r,
      upcoming: r.isActive ? nextOccurrences(r, 3) : [],
    }));
    return c.json({ data });
  })
  .post("/process", clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const now = new Date();
    const due = await db
      .select()
      .from(rules)
      .where(
        and(
          eq(rules.userId, userId),
          eq(rules.isActive, true),
          lte(rules.nextDate, endOfDay(now)),
        ),
      );

    let created = 0;
    for (const rule of due) {
      const { dates, nextDate, finished } = getDueOccurrences({ ...rule, now });
      if (!dates.length && !finished) continue;

      // Claim atomically: only one concurrent caller matches the old nextDate.
      // ponytail: neon-http has no transactions, so a crash between claim and
      // insert drops that batch; use db.batch/outbox if that ever matters.
      const claimed = await db
        .update(rules)
        .set({ nextDate, isActive: !finished })
        .where(
          and(
            eq(rules.id, rule.id),
            eq(rules.nextDate, rule.nextDate),
            eq(rules.isActive, true),
          ),
        )
        .returning({ id: rules.id });
      if (!claimed.length || !dates.length) continue;

      await db.insert(transactions).values(
        dates.map((date) => ({
          id: createId(),
          date,
          amount: rule.amount,
          payee: rule.payee,
          notes: rule.notes,
          accountId: rule.accountId,
          categoryId: rule.categoryId,
          recurringId: rule.id,
        })),
      );
      created += dates.length;
    }

    return c.json({ data: { created } });
  })
  .get("/:id", idParam, clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { id } = c.req.valid("param");

    const [data] = await db
      .select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)));
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json({ data });
  })
  .post("/", clerkMiddleware(), zValidator("json", bodySchema), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const values = c.req.valid("json");

    if (!(await ownsRefs(userId, values.accountId, values.categoryId))) {
      return c.json({ error: "Invalid account or category" }, 400);
    }

    const [data] = await db
      .insert(rules)
      .values({
        ...values,
        id: createId(),
        userId,
        nextDate: values.startDate,
      })
      .returning();
    return c.json({ data });
  })
  .patch(
    "/:id",
    idParam,
    clerkMiddleware(),
    zValidator("json", bodySchema),
    async (c) => {
      const userId = getAuth(c)?.userId;
      if (!userId) return c.json({ error: "Unauthorized" }, 401);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(rules)
        .where(and(eq(rules.id, id), eq(rules.userId, userId)));
      if (!existing) return c.json({ error: "Not found" }, 404);

      if (!(await ownsRefs(userId, values.accountId, values.categoryId))) {
        return c.json({ error: "Invalid account or category" }, 400);
      }

      const scheduleChanged =
        existing.frequency !== values.frequency ||
        existing.startDate.getTime() !== values.startDate.getTime();
      const nextDate = scheduleChanged
        ? firstOccurrenceFrom(values.startDate, values.frequency, new Date())
        : existing.nextDate;

      const [data] = await db
        .update(rules)
        .set({ ...values, endDate: values.endDate ?? null, nextDate })
        .where(and(eq(rules.id, id), eq(rules.userId, userId)))
        .returning();
      return c.json({ data });
    },
  )
  .post("/:id/toggle", idParam, clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { id } = c.req.valid("param");

    const [existing] = await db
      .select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)));
    if (!existing) return c.json({ error: "Not found" }, 404);

    // Resuming skips what was missed while paused instead of back-filling it.
    const isActive = !existing.isActive;
    const nextDate = isActive
      ? firstOccurrenceFrom(existing.startDate, existing.frequency, new Date())
      : existing.nextDate;

    const [data] = await db
      .update(rules)
      .set({ isActive, nextDate })
      .where(and(eq(rules.id, id), eq(rules.userId, userId)))
      .returning();
    return c.json({ data });
  })
  .delete("/:id", idParam, clerkMiddleware(), async (c) => {
    const userId = getAuth(c)?.userId;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { id } = c.req.valid("param");

    const [data] = await db
      .delete(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)))
      .returning({ id: rules.id });
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json({ data });
  });

export default app;
