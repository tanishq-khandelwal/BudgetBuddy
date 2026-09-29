import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

const DEFAULT_SETTINGS = { currency: "USD" };

const app = new Hono()
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
