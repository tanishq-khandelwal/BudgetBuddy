import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema, transactions } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
const app = new Hono()
  .onError((error, c) => {
    console.error("API error:", error);
    if (error instanceof HTTPException) return error.getResponse();
    return c.json({ error: "Something went wrong. Please try again." }, 500);
  })
  .get("/", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = await db
        .select({
          id: accounts.id,
          name: accounts.name,
          transactionCount: sql<number>`count(${transactions.id})::int`,
          balance: sql<number>`coalesce(sum(${transactions.amount}), 0)::float8`,
        })
        .from(accounts)
        .leftJoin(transactions, eq(transactions.accountId, accounts.id))
        .where(eq(accounts.userId, auth.userId))
        .groupBy(accounts.id, accounts.name)
        .orderBy(accounts.name);

      return c.json({ data });
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      return c.json(
        {
          error: "Failed to fetch data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  })
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
        return c.json({ error: "Missing account id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)));

      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json({
        data,
      });
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

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids),
          ),
        )
        .returning({
          id: accounts.id,
        });

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
      insertAccountSchema.pick({
        name: true,
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
        return c.json({ error: "Missing account id" }, 400);
      }
      const [data] = await db
        .update(accounts)
        .set({
          ...values,
        })
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning();
      if (!data) {
        return c.json({ error: "Account not found" }, 404);
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
        return c.json({ error: "Missing account id" }, 400);
      }

      const [data] = await db
        .delete(accounts)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }

      return c.json({ data });
    },
  );

export default app;
