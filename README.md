# BudgetBuddy

Personal finance, beautifully simple. Track every account and transaction, set
monthly budgets, automate recurring bills and income, and see exactly where
your money goes — on desktop or phone, in light or dark mode.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

- **Dashboard** — balance, income, expenses and savings rate with
  period-over-period change, an income vs expenses chart, spending by
  category, recent transactions and budget progress.
- **Transactions** — add, edit and bulk-delete; filter by date range and
  account; **CSV import** with column mapping and row selection
  (see [`CSV_IMPORT_README.md`](./CSV_IMPORT_README.md)).
- **Accounts & categories** — balances and transaction counts at a glance.
- **Budgets** — a monthly limit per category, progress bars, over-budget
  alerts and a safe-to-spend-per-day figure.
- **Recurring transactions** — rent, salary, subscriptions: define the rule
  once and the transactions are created automatically when they fall due.
- **Reports** — monthly cash flow, category and payee breakdowns, per-account
  totals, auto-generated insights, CSV export.
- **Settings** — display currency, light/dark/system theme, full data export
  and a delete-all-data option.
- **Made for every screen** — collapsible sidebar on desktop, app-style bottom
  tab bar on mobile, ⌘K command palette, dark mode throughout.

## Tech stack

| Area      | Choice                                                      |
| --------- | ----------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript               |
| UI        | Tailwind CSS, shadcn/ui, Radix, lucide-react, framer-motion |
| Data      | TanStack Query, Hono RPC API, Zod                           |
| Database  | PostgreSQL (Neon) with Drizzle ORM                          |
| Auth      | Clerk                                                       |
| Charts    | Recharts                                                    |

## Getting started

Prerequisites: Node.js 20+, a Postgres database (e.g. [Neon](https://neon.tech)),
and a [Clerk](https://clerk.com) application.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:migrate           # creates the tables
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable                            | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                      | Postgres connection string                   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                        |
| `CLERK_SECRET_KEY`                  | Clerk secret key                             |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | `/sign-in`                                   |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | `/sign-up`                                   |
| `NEXT_PUBLIC_APP_URL`               | Base URL of the app (used by the API client) |

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # unit tests (lib/**/*.test.ts)
npm run db:generate  # generate a migration after changing db/schema.ts
npm run db:migrate   # apply migrations
npm run db:studio    # browse the database
```

## Project structure

```
app/
  page.tsx                 # public landing page
  (auth)/                  # sign-in / sign-up
  (dashboard)/             # the signed-in app: dashboard, transactions,
                           # accounts, categories, budgets, recurring,
                           # reports, settings
  api/[[...route]]/        # Hono API, one file per resource
components/
  layout/                  # sidebar, top bar, mobile nav, command menu
  landing/                 # landing page sections
  ui/                      # shadcn/ui primitives
features/<resource>/       # API hooks, forms, sheets per feature
db/schema.ts               # Drizzle schema (money stored as miliunits)
drizzle/                   # SQL migrations
lib/                       # utilities, recurring-date logic
```
