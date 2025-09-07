import { Hono } from "hono";
import { handle } from "hono/vercel";
import account from "./account";
import categories from "./categories"
import { HTTPException } from "hono/http-exception";
import { clerkMiddleware } from "@hono/clerk-auth";
import transactions from './transactions'

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

// Define the type for the Hono app instance
const routes = app
  .use("*", clerkMiddleware())
  .route("/account", account)
  .route("/categories", categories)
  .route("/transactions",transactions)

export type AppType = typeof routes;

// Export the handler for Vercel
export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);
