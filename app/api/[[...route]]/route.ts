import { Hono } from "hono";
import { handle } from "hono/vercel";
import account from "./account";
import categories from "./categories";
import { HTTPException } from "hono/http-exception";
import { clerkMiddleware } from "@hono/clerk-auth";
import transactions from "./transactions";
import summary from "./summary";

export const runtime = "edge";

const app = new Hono().basePath("/api");

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
    500,
  );
});

// Define the type for the Hono app instance
const routes = app
  .use("*", clerkMiddleware())
  .route("/account", account)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary);

export type AppType = typeof routes;

// Export the handler for Vercel
export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);
