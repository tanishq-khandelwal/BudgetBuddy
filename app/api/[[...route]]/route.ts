import { Hono } from "hono";
import { handle } from "hono/vercel";
import account from "./account";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app.route("/accounts", account);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
