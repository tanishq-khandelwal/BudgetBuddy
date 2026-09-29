import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  transactions,
  insertTransactionsSchema,
  categories,
  accounts,
} from "@/db/schema";
import { endOfDay, parse, startOfDay, startOfMonth } from "date-fns";
import { HTTPException } from "hono/http-exception";
import { and, eq, gte, inArray, lte, desc, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";

// Rejects (400) any account/category id that doesn't belong to the user.
const assertOwnership = async (
  userId: string,
  accountIds: string[],
  categoryIds: (string | null | undefined)[],
) => {
  const accIds = [...new Set(accountIds)];
  const catIds = [...new Set(categoryIds.filter((v): v is string => !!v))];

  if (accIds.length) {
    const owned = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), inArray(accounts.id, accIds)));
    if (owned.length !== accIds.length) {
      throw new HTTPException(400, { message: "Invalid account" });
    }
  }
  if (catIds.length) {
    const owned = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.userId, userId), inArray(categories.id, catIds)),
      );
    if (owned.length !== catIds.length) {
      throw new HTTPException(400, { message: "Invalid category" });
    }
  }
};

const app = new Hono()
  .onError((error, c) => {
    console.error("API error:", error);
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Something went wrong. Please try again." }, 500);
  })
  .get(
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

      const now = new Date();
      const startDate = from
        ? startOfDay(parse(from, "yyyy-MM-dd", now))
        : startOfMonth(now);
      const endDate = endOfDay(to ? parse(to, "yyyy-MM-dd", now) : now);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return c.json({ error: "Invalid date range" }, 400);
      }

      try {
        const data = await db
          .select({
            id: transactions.id,
            date: transactions.date,
            category: categories.name,
            categoryId: transactions.categoryId,
            payee: transactions.payee,
            amount: transactions.amount,
            notes: transactions.notes,
            recurringId: transactions.recurringId,
            account: accounts.name,
            accountId: transactions.accountId,
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(
            and(
              accountId ? eq(transactions.accountId, accountId) : undefined,
              eq(accounts.userId, auth.userId),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate),
            ),
          )
          .orderBy(desc(transactions.date));

        return c.json({ data });
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return c.json(
          {
            error: "Failed to fetch data",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    },
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing transaction id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(accounts.userId, auth.userId), eq(transactions.id, id)));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTransactionsSchema.omit({
        id: true,
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await assertOwnership(
        auth.userId,
        [values.accountId],
        [values.categoryId],
      );

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({
        data,
      });
    },
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator(
      "json",
      z.array(
        insertTransactionsSchema.omit({
          id: true,
        }),
      ),
    ),

    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!values.length) return c.json({ data: [] });
      await assertOwnership(
        auth.userId,
        values.map((v) => v.accountId),
        values.map((v) => v.categoryId),
      );

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          })),
        )

        .returning();

      return c.json({ data });
    },
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      }),
    ),

    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );
      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`,
          ),
        )
        .returning({ id: transactions.id });
      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator(
      "json",
      insertTransactionsSchema.omit({
        id: true,
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      if (!id) {
        return c.json({ error: "Missing transaction id" }, 400);
      }

      await assertOwnership(
        auth.userId,
        [values.accountId],
        [values.categoryId],
      );

      const transactionToUpdate = db.$with("transactions_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
          ),
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionToUpdate} )`,
          ),
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      if (!id) {
        return c.json({ error: "Missing transaction id" }, 400);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
          ),
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`,
          ),
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  );

export default app;
