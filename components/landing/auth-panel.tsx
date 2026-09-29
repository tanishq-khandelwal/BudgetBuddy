"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  BarChart3,
  CalendarClock,
  Check,
  PieChart,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

const SLIDE_MS = 5500;

type Slide = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  body: string;
  Visual: () => React.JSX.Element;
};

// The brand panel beside the sign-in / sign-up form (lg+ only). It is always a
// dark surface regardless of theme, so it uses white-alpha text on a fixed
// night background plus theme accent tokens for the visuals.
export const AuthPanel = () => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];
  const next = () => setIndex((i) => (i + 1) % SLIDES.length);

  return (
    <aside
      className="relative m-3 hidden overflow-hidden rounded-[28px] bg-[hsl(245_45%_7%)] text-white ring-1 ring-white/10 lg:flex lg:flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="What you can do with BudgetBuddy"
    >
      <Aurora still={!!reduce} />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <Sparkles className="size-3.5 text-chart-4" />
          Personal finance, beautifully simple
        </div>

        <div className="relative mx-auto w-full max-w-md py-10">
          <FloatingChips still={!!reduce} />

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 24, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -16, filter: "blur(6px)" }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              aria-live="polite"
            >
              <GlassCard>
                <slide.Visual />
              </GlassCard>

              <div className="mt-8">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                  <slide.icon className="size-3.5" />
                  {slide.eyebrow}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight xl:text-[34px] xl:leading-tight">
                  {slide.title}
                </h2>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/65">
                  {slide.body}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2" role="tablist" aria-label="Slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.eyebrow}
                onClick={() => setIndex(i)}
                className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15 outline-none transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {i < index && (
                  <span className="absolute inset-0 rounded-full bg-white/70" />
                )}
                {i === index && (
                  <span
                    key={index}
                    onAnimationEnd={next}
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    style={
                      reduce
                        ? { width: "100%" }
                        : {
                            animation: `bb-progress ${SLIDE_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                    }
                  />
                )}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-white/45">
            <ShieldCheck className="size-3.5" />
            Your data is private to you and exportable anytime
          </p>
        </div>
      </div>
    </aside>
  );
};

/* ---------- Background ---------- */

const Aurora = ({ still }: { still: boolean }) => {
  const blob = (
    className: string,
    x: number[],
    y: number[],
    duration: number,
  ) => (
    <motion.div
      aria-hidden="true"
      className={cn("absolute rounded-full blur-[90px]", className)}
      animate={still ? undefined : { x, y, scale: [1, 1.15, 0.95, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {blob(
        "-left-24 -top-24 size-[28rem] bg-primary/55",
        [0, 60, -20, 0],
        [0, 40, 80, 0],
        18,
      )}
      {blob(
        "-right-32 top-1/3 size-[26rem] bg-chart-3/35",
        [0, -70, 20, 0],
        [0, -30, 50, 0],
        22,
      )}
      {blob(
        "-bottom-40 left-1/4 size-[30rem] bg-chart-2/25",
        [0, 50, -40, 0],
        [0, -60, 10, 0],
        26,
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_40%,rgb(0_0_0/0.45))]" />
    </div>
  );
};

const FloatingChips = ({ still }: { still: boolean }) => {
  const { format } = useCurrency();
  const chips = [
    {
      className: "-left-16 top-2",
      icon: TrendingUp,
      tone: "text-success",
      label: "Salary received",
      value: `+${format(3200, { maximumFractionDigits: 0 })}`,
      delay: 0,
    },
    {
      className: "-right-16 top-[140px]",
      icon: CalendarClock,
      tone: "text-chart-4",
      label: "Netflix renews",
      value: "Tomorrow",
      delay: 1.2,
    },
    {
      className: "-right-8 -top-5",
      icon: PiggyBank,
      tone: "text-chart-1",
      label: "Savings rate",
      value: "31%",
      delay: 2.4,
    },
  ];

  return (
    <div aria-hidden="true" className="hidden xl:block">
      {chips.map((c) => (
        <motion.div
          key={c.label}
          className={cn(
            "absolute z-20 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 shadow-xl shadow-black/30 backdrop-blur-xl",
            c.className,
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            still
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -8, 0] }
          }
          transition={{
            opacity: { duration: 0.6, delay: 0.4 + c.delay / 3 },
            scale: { duration: 0.6, delay: 0.4 + c.delay / 3 },
            y: {
              duration: 5 + c.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: c.delay,
            },
          }}
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-white/10">
            <c.icon className={cn("size-3.5", c.tone)} />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] text-white/50">{c.label}</span>
            <span className="block text-xs font-semibold tabular-nums">
              {c.value}
            </span>
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
    <div
      aria-hidden="true"
      className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
    />
    {children}
  </div>
);

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Slide visuals ---------- */

const SpendingVisual = () => {
  const { format } = useCurrency();
  const segments = [
    { label: "Housing", pct: 38, color: "hsl(var(--chart-1))" },
    { label: "Groceries", pct: 26, color: "hsl(var(--chart-2))" },
    { label: "Transport", pct: 20, color: "hsl(var(--chart-4))" },
    { label: "Fun", pct: 16, color: "hsl(var(--chart-3))" },
  ];
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 128 128" className="size-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="14"
          />
          {segments.map((s, i) => {
            const len = (s.pct / 100) * c - 3;
            const dashOffset = -offset;
            offset += (s.pct / 100) * c;
            return (
              <motion.circle
                key={s.label}
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDashoffset={dashOffset}
                initial={{ strokeDasharray: `0 ${c}` }}
                animate={{ strokeDasharray: `${len} ${c}` }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.18, ease }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Spent
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {format(2480, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {segments.map((s, i) => (
          <motion.li
            key={s.label}
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-white/75">{s.label}</span>
            <span className="tabular-nums text-white/55">{s.pct}%</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const BudgetsVisual = () => {
  const { format } = useCurrency();
  const rows = [
    { name: "Groceries", spent: 420, limit: 600, bar: "bg-chart-1" },
    { name: "Transport", spent: 96, limit: 200, bar: "bg-chart-2" },
    { name: "Dining out", spent: 238, limit: 250, bar: "bg-warning" },
    { name: "Shopping", spent: 324, limit: 300, bar: "bg-destructive" },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r, i) => {
        const pct = (r.spent / r.limit) * 100;
        const over = pct > 100;
        return (
          <div key={r.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/80">
                {r.name}
                {over && (
                  <motion.span
                    className="rounded-full bg-destructive/20 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                    }}
                  >
                    Over by{" "}
                    {format(r.spent - r.limit, { maximumFractionDigits: 0 })}
                  </motion.span>
                )}
              </span>
              <span className="tabular-nums text-white/50">
                {format(r.spent, { maximumFractionDigits: 0 })} /{" "}
                {format(r.limit, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={cn("h-full rounded-full", r.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 + i * 0.15, ease }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RecurringVisual = () => {
  const { format } = useCurrency();
  const items = [
    { payee: "Rent", when: "Oct 1", amount: -1200 },
    { payee: "Salary", when: "Oct 1", amount: 3200 },
    { payee: "Spotify", when: "Oct 3", amount: -11.99 },
    { payee: "Gym", when: "Oct 5", amount: -39 },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-white/50">
        <span>Upcoming this week</span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          Auto-created
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <motion.li
            key={it.payee}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.22, duration: 0.45, ease }}
          >
            <motion.span
              className="flex size-6 items-center justify-center rounded-full bg-success/20 text-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.55 + i * 0.22,
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
            >
              <Check className="size-3.5" />
            </motion.span>
            <span className="flex-1 text-sm text-white/85">{it.payee}</span>
            <span className="text-xs text-white/40">{it.when}</span>
            <span
              className={cn(
                "w-20 text-right text-sm font-medium tabular-nums",
                it.amount > 0 ? "text-success" : "text-white/80",
              )}
            >
              {it.amount > 0 ? "+" : "−"}
              {format(Math.abs(it.amount))}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const ReportsVisual = () => {
  const bars = [42, 58, 50, 71, 64, 48];
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return (
    <div>
      <div className="flex h-36 items-end gap-3">
        {bars.map((h, i) => (
          <div
            key={months[i]}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <motion.div
              className={cn(
                "w-full origin-bottom rounded-t-md",
                i === bars.length - 1
                  ? "bg-gradient-to-t from-primary to-chart-3"
                  : "bg-white/15",
              )}
              style={{ height: `${h * 1.6}px` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease }}
            />
            <span className="text-[10px] text-white/40">{months[i]}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="mt-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-sm text-success"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.45, ease }}
      >
        <ArrowDownRight className="size-4" />
        You spent 25% less than last month
      </motion.div>
    </div>
  );
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Insights",
    icon: PieChart,
    title: "See exactly where your money goes.",
    body: "Every transaction lands in a category, so the big picture is always one glance away.",
    Visual: SpendingVisual,
  },
  {
    eyebrow: "Budgets",
    icon: PiggyBank,
    title: "Budgets that keep you honest.",
    body: "Set a monthly limit per category and watch progress in real time, with a heads-up before you overspend.",
    Visual: BudgetsVisual,
  },
  {
    eyebrow: "Recurring",
    icon: CalendarClock,
    title: "Bills and salary on autopilot.",
    body: "Define rent, subscriptions and paychecks once. They're recorded automatically when they fall due.",
    Visual: RecurringVisual,
  },
  {
    eyebrow: "Reports",
    icon: BarChart3,
    title: "Reports that explain themselves.",
    body: "Monthly cash flow, top payees and plain-English insights, ready to export whenever you need them.",
    Visual: ReportsVisual,
  },
];
