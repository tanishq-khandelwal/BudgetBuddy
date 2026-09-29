"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  startOfDay,
} from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Plus,
  Repeat,
  Scale,
  Trash,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/use-currency";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { nextOccurrences, toMonthlyAmount } from "@/lib/recurring";
import { useGetRecurringList } from "../api/use-get-recurring-list";
import { useToggleRecurring } from "../api/use-toggle-recurring";
import { useDeleteRecurring } from "../api/use-delete-recurring";
import { useNewRecurring } from "../hooks/use-new-recurring";
import { useOpenRecurring } from "../hooks/use-open-recurring";
import { FREQUENCY_LABEL } from "./recurring-form";

type Rule = NonNullable<ReturnType<typeof useGetRecurringList>["data"]>[number];
type Filter = "all" | "income" | "expenses" | "paused";

const schedule = (r: Rule) => ({
  frequency: r.frequency,
  startDate: new Date(r.startDate),
  nextDate: new Date(r.nextDate),
  endDate: r.endDate ? new Date(r.endDate) : null,
});

const relative = (date: Date) => {
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return "due now";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 45) return `in ${days} days`;
  return formatDistanceToNowStrict(date, { addSuffix: true });
};

const matches = (r: Rule, f: Filter) =>
  f === "all" ||
  (f === "paused" && !r.isActive) ||
  (f === "income" && r.amount > 0) ||
  (f === "expenses" && r.amount < 0);

export const RecurringView = () => {
  const query = useGetRecurringList();
  const toggle = useToggleRecurring();
  const remove = useDeleteRecurring();
  const newRecurring = useNewRecurring();
  const openRecurring = useOpenRecurring();
  const { formatMiliunits } = useCurrency();
  const [filter, setFilter] = useState<Filter>("all");
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete recurring transaction?",
    "Transactions already created from it are kept. This can't be undone.",
  );

  const rules = useMemo(() => query.data ?? [], [query.data]);

  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const r of rules) {
      if (!r.isActive) continue;
      const m = toMonthlyAmount(r.amount, r.frequency);
      if (m > 0) income += m;
      else expenses += m;
    }
    return { income, expenses, net: income + expenses };
  }, [rules]);

  const upcoming = useMemo(() => {
    const horizon = addDays(startOfDay(new Date()), 30);
    const items = rules
      .filter((r) => r.isActive)
      .flatMap((r) =>
        nextOccurrences(schedule(r), 40)
          .filter((d) => d <= horizon)
          .map((date) => ({ rule: r, date })),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const groups = new Map<string, typeof items>();
    for (const item of items) {
      const key = format(item.date, "yyyy-MM-dd");
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.entries()];
  }, [rules]);

  const counts = {
    all: rules.length,
    income: rules.filter((r) => matches(r, "income")).length,
    expenses: rules.filter((r) => matches(r, "expenses")).length,
    paused: rules.filter((r) => matches(r, "paused")).length,
  };
  const visible = rules.filter((r) => matches(r, filter));

  const onDelete = async (id: string) => {
    if (await confirm()) remove.mutate(id);
  };

  const newAction = (
    <Button onClick={newRecurring.onOpen} className="h-10">
      <Plus className="mr-2 size-4" />
      New recurring
    </Button>
  );

  const header = (
    <PageHeader
      title="Recurring"
      description="Rent, salary, subscriptions — added automatically on schedule."
      actions={newAction}
    />
  );

  if (query.isLoading) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        {header}
        <EmptyState
          icon={Repeat}
          title="Couldn't load recurring transactions"
          description="Something went wrong on our side. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (!rules.length) {
    return (
      <>
        {header}
        <EmptyState
          icon={Repeat}
          title="No recurring transactions yet"
          description="Set up things like Rent, Salary or Netflix once, and BudgetBuddy adds them for you every time they're due."
          action={newAction}
        />
      </>
    );
  }

  const summary = [
    {
      label: "Monthly income",
      value: totals.income,
      icon: ArrowDownLeft,
      tone: "text-success bg-success/10",
    },
    {
      label: "Monthly expenses",
      value: totals.expenses,
      icon: ArrowUpRight,
      tone: "text-destructive bg-destructive/10",
    },
    {
      label: "Net per month",
      value: totals.net,
      icon: Scale,
      tone: "text-primary bg-primary/10",
    },
  ];

  const controls = (r: Rule) => (
    <>
      <Switch
        checked={r.isActive}
        disabled={toggle.isPending}
        onCheckedChange={() => toggle.mutate(r.id)}
        aria-label={`${r.isActive ? "Pause" : "Resume"} ${r.payee}`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label={`Actions for ${r.payee}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openRecurring.onOpen(r.id)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(r.id)}
          >
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const amountCell = (r: Rule) => (
    <span
      className={cn(
        "font-semibold tabular-nums",
        r.amount > 0 ? "text-success" : "text-destructive",
      )}
    >
      {r.amount > 0 ? "+" : ""}
      {formatMiliunits(r.amount)}
    </span>
  );

  const meta = (r: Rule) => [r.account, r.category].filter(Boolean).join(" · ");

  return (
    <>
      <ConfirmDialog />
      {header}

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  s.tone,
                )}
              >
                <s.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
              {formatMiliunits(Math.round(s.value))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated, active rules
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="upcoming-heading">
        <h2
          id="upcoming-heading"
          className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <CalendarClock className="size-5 text-muted-foreground" />
          Upcoming
          <span className="text-sm font-normal text-muted-foreground">
            next 30 days
          </span>
        </h2>
        {upcoming.length ? (
          <ol className="divide-y rounded-xl border bg-card shadow-sm">
            {upcoming.map(([key, items]) => {
              const date = items[0].date;
              return (
                <li key={key} className="flex gap-4 p-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {format(date, "MMM")}
                    </p>
                    <p className="text-xl font-semibold leading-tight">
                      {format(date, "d")}
                    </p>
                  </div>
                  <ul className="min-w-0 flex-1 space-y-2">
                    {items.map(({ rule }) => (
                      <li
                        key={rule.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="truncate text-sm font-medium">
                          {rule.payee}
                        </span>
                        {amountCell(rule)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing scheduled in the next 30 days.
          </p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="rules-heading">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="rules-heading"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <CalendarDays className="size-5 text-muted-foreground" />
            All rules
          </h2>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="grid h-10 w-full grid-cols-4 sm:inline-flex sm:w-auto">
              {(["all", "income", "expenses", "paused"] as const).map((f) => (
                <TabsTrigger key={f} value={f} className="capitalize">
                  {f}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {counts[f]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {!visible.length ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No {filter} recurring transactions.
          </p>
        ) : (
          <>
            {/* Mobile: cards */}
            <ul className="space-y-3 md:hidden">
              {visible.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    "rounded-xl border bg-card p-4 shadow-sm",
                    !r.isActive && "opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.payee}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {meta(r)}
                      </p>
                    </div>
                    {amountCell(r)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        {FREQUENCY_LABEL[r.frequency]}
                      </Badge>
                      {r.isActive ? relative(new Date(r.nextDate)) : "Paused"}
                    </div>
                    <div className="flex items-center gap-1">{controls(r)}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden rounded-xl border bg-card shadow-sm md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next</TableHead>
                    <TableHead>Account / category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => (
                    <TableRow
                      key={r.id}
                      className={cn(!r.isActive && "text-muted-foreground")}
                    >
                      <TableCell className="font-medium">{r.payee}</TableCell>
                      <TableCell>{amountCell(r)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {FREQUENCY_LABEL[r.frequency]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.isActive ? (
                          <>
                            {relative(new Date(r.nextDate))}
                            <span className="block text-xs text-muted-foreground">
                              {format(new Date(r.nextDate), "MMM d, yyyy")}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {meta(r)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={r.isActive}
                            disabled={toggle.isPending}
                            onCheckedChange={() => toggle.mutate(r.id)}
                            aria-label={`${r.isActive ? "Pause" : "Resume"} ${r.payee}`}
                          />
                          <span className="text-sm">
                            {r.isActive ? "Active" : "Paused"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10"
                              aria-label={`Actions for ${r.payee}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openRecurring.onOpen(r.id)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(r.id)}
                            >
                              <Trash className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>
    </>
  );
};
