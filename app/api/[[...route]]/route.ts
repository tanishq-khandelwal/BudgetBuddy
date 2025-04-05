import { Hono } from "hono";
import { handle } from "hono/vercel";
import account from "./account";
import { HTTPException } from "hono/http-exception";
import { clerkMiddleware } from "@hono/clerk-auth";

export const runtime = "edge";

const app = new Hono().basePath("/api");

console.log("Environment check:", {
  hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  hasSecretKey: !!process.env.CLERK_SECRET_KEY,
});

app.use("*", clerkMiddleware());

app.onError((err, c) => {
  console.error("Unhandled Error:", err);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json(
    {
      error: "Internal Server Error",
      message: err.message || "Unknown error",
      stack: err.stack || null,
    },
    500
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app.route("/accounts", account);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
