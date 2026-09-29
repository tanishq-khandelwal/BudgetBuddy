import { CalendarClock, PiggyBank, TrendingUp } from "lucide-react";

export const AuthPanel = () => (
  <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-center lg:p-14">
    <div
      aria-hidden="true"
      className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
    />
    <div className="relative max-w-md">
      <h2 className="text-balance text-3xl font-semibold tracking-tight">
        Spend with confidence. Save on purpose.
      </h2>
      <p className="mt-3 text-primary-foreground/80">
        Budgets, recurring bills and reports, all in one calm place.
      </p>
      <div className="mt-10 space-y-3" aria-hidden="true">
        <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <PiggyBank className="size-4" /> Groceries budget
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-primary-foreground/20">
            <div className="h-full w-2/3 rounded-full bg-primary-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur">
            <TrendingUp className="size-4" />
            <p className="mt-2 text-sm">Monthly trends</p>
          </div>
          <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur">
            <CalendarClock className="size-4" />
            <p className="mt-2 text-sm">Recurring on autopilot</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
);
