import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { clerkMiddleware } from "@hono/clerk-auth";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

const app = new Hono().get("/", clerkMiddleware(), async (c) => {
  const { userId } = await auth();

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return c.json({ data });
  } catch (error: any) {
    return c.json(
      { error: "Failed to fetch data", details: error.message },
      500
    );
  }
});

export default app;
