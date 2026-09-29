# BudgetBuddy

Personal finance app: accounts, categories, transactions (with CSV import),
budgets, recurring transactions, reports, and settings, behind Clerk auth.

## Stack

- **Next.js 16** (App Router, React 19) — `proxy.ts` (not `middleware.ts`) runs
  Clerk auth; `/`, `/sign-in`, `/sign-up` are public, everything else is protected.
- **API**: one Hono app mounted at `app/api/[[...route]]/route.ts`, one file per
  resource (`account.ts`, `categories.ts`, `transactions.ts`, `summary.ts`,
  `budgets.ts`, `recurring.ts`, `reports.ts`, `settings.ts`). Node runtime.
- **Client calls** go through the typed Hono RPC client in `lib/hono.ts`
  (`client.api.<resource>...`), wrapped in TanStack Query hooks under
  `features/<resource>/api/use-*.ts`.
- **DB**: Postgres (Neon) via Drizzle. Schema in `db/schema.ts`; migrations in
  `drizzle/` (`npm run db:generate`, then `npm run db:migrate`).
- **UI**: Tailwind 3 + shadcn/ui (`components/ui`), Radix, lucide-react icons,
  Recharts, framer-motion (landing page), sonner toasts, next-themes.

## Conventions

- **Money is stored as integer miliunits** (1.00 = 1000). Convert with
  `convertAmountToMiliunits` / `convertAmountFromMiliunits` (`lib/utils.ts`).
  Negative = expense, positive = income.
- **Display amounts with `useCurrency()`** (`hooks/use-currency.ts`), which
  formats in the user's chosen currency. Never hardcode `"USD"` or `$`.
- **Every API handler** checks `getAuth(c)?.userId` and scopes queries to that
  user (transactions are scoped through their account's `userId`).
- **Colors come from theme tokens** in `app/globals.css` (`bg-background`,
  `bg-card`, `text-muted-foreground`, `text-success`, `text-destructive`,
  `bg-primary`…). Never hardcode `bg-white`, `text-gray-*`, or hex colors —
  dark mode depends on it.
- **Layout**: dashboard pages render inside `app/(dashboard)/layout.tsx`
  (sidebar on desktop, bottom tab bar on mobile). Start each page with
  `<PageHeader>` (`components/page-header.tsx`); use `<EmptyState>` for empty lists.
- **Mobile first**: every screen must work at 375px wide — stack filters, use
  card lists instead of wide tables on small screens, 44px tap targets.
- **Sheets** (create/edit forms) are driven by zustand stores in
  `features/<resource>/hooks/` and mounted once in `providers/sheet-provider.tsx`.

## Commands

```bash
npm run dev         # dev server
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (flat config)
npm test            # tsx --test for lib/**/*.test.ts
npm run build       # production build
```

`npm run build` needs env vars; for a local check without real credentials:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000 DATABASE_URL=postgresql://u:p@localhost/db \
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_$(printf 'example.clerk.accounts.dev$' | base64) \
CLERK_SECRET_KEY=sk_test_x npm run build
```

## Git

Commits are authored by the repo owner only — no `Co-Authored-By` trailers or
"Generated with" lines in commits or PRs.
