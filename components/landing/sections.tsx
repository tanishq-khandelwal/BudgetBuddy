"use client";

import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Command,
  Download,
  FileUp,
  Globe2,
  Landmark,
  Lock,
  PiggyBank,
  ShieldCheck,
  Tags,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const Heading = ({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) => (
  <div className="mx-auto max-w-2xl text-center">
    <p className="text-sm font-medium text-primary">{eyebrow}</p>
    <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
      {title}
    </h2>
    {sub && <p className="mt-3 text-balance text-muted-foreground">{sub}</p>}
  </div>
);

const Section = ({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    id={id}
    className={cn("scroll-mt-16 px-4 py-16 sm:px-6 sm:py-24", className)}
  >
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

export const Stats = () => (
  <section aria-label="Highlights" className="border-y bg-muted/30">
    <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
      {[
        ["8", "tools in one app"],
        ["Private", "your data, only yours"],
        ["Light & dark", "themes built in"],
        ["⌘K", "jump anywhere"],
      ].map(([v, l]) => (
        <div key={l} className="text-center">
          <dt className="text-2xl font-semibold tracking-tight">{v}</dt>
          <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
        </div>
      ))}
    </dl>
  </section>
);

const Tile = ({
  icon: Icon,
  title,
  text,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cn(
      "flex flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6",
      className,
    )}
  >
    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" />
    </span>
    <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
    <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
    {children && <div className="mt-5 flex-1">{children}</div>}
  </div>
);

const Bar = ({ pct, tone = "bg-primary" }: { pct: number; tone?: string }) => (
  <div className="h-1.5 rounded-full bg-muted">
    <div
      className={cn("h-full rounded-full", tone)}
      style={{ width: `${pct}%` }}
    />
  </div>
);

export const Features = () => (
  <Section id="features">
    <Reveal>
      <Heading
        eyebrow="Features"
        title="Everything you need to run your money"
        sub="No spreadsheets, no juggling apps. One calm place for the whole picture."
      />
    </Reveal>
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      <Reveal className="md:col-span-2 [&>div]:h-full">
        <Tile
          icon={BarChart3}
          title="A dashboard that gets to the point"
          text="Income, expenses and balance at a glance, with trends and category charts for any date range."
        >
          <div className="flex h-24 items-end gap-2" aria-hidden="true">
            {[40, 65, 50, 80, 60, 92, 70, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-primary/20 first:bg-primary/20 last:bg-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Tile>
      </Reveal>
      <Reveal delay={0.05} className="[&>div]:h-full">
        <Tile
          icon={PiggyBank}
          title="Monthly budgets"
          text="Set limits per category and watch progress as you spend."
        >
          <div className="space-y-3" aria-hidden="true">
            <Bar pct={70} />
            <Bar pct={88} tone="bg-warning" />
            <Bar pct={32} tone="bg-success" />
          </div>
        </Tile>
      </Reveal>
      <Reveal className="[&>div]:h-full">
        <Tile
          icon={CalendarClock}
          title="Recurring, on autopilot"
          text="Bills, salary and subscriptions are created for you on schedule."
        >
          <div
            className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground"
            aria-hidden="true"
          >
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-md py-1.5",
                  [2, 9].includes(i)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </Tile>
      </Reveal>
      <Reveal delay={0.05} className="[&>div]:h-full">
        <Tile
          icon={FileUp}
          title="Import from CSV"
          text="Bring in bank exports in seconds and map the columns once."
        />
      </Reveal>
      <Reveal delay={0.1} className="[&>div]:h-full">
        <Tile
          icon={Command}
          title="Command palette"
          text="Search and navigate the whole app from your keyboard."
        >
          <kbd className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 font-mono text-xs">
            ⌘ K
          </kbd>
        </Tile>
      </Reveal>
      <Reveal className="[&>div]:h-full">
        <Tile
          icon={Landmark}
          title="Multiple accounts"
          text="Checking, savings, cards and cash, each tracked separately."
        />
      </Reveal>
      <Reveal delay={0.05} className="[&>div]:h-full">
        <Tile
          icon={Tags}
          title="Custom categories"
          text="Organize spending your way and see exactly where it goes."
        />
      </Reveal>
      <Reveal delay={0.1} className="[&>div]:h-full">
        <Tile
          icon={Globe2}
          title="Reports & multi-currency"
          text="Monthly trends, top payees, CSV export, shown in your currency."
        />
      </Reveal>
    </div>
  </Section>
);

const steps = [
  ["Create your account", "Sign up in seconds. No credit card, no setup call."],
  [
    "Add accounts & transactions",
    "Enter them by hand or import a CSV from your bank.",
  ],
  [
    "Budget and watch it work",
    "Set budgets, schedule recurring items and follow your reports.",
  ],
];

export const HowItWorks = () => (
  <Section id="how-it-works" className="border-y bg-muted/30">
    <Reveal>
      <Heading eyebrow="How it works" title="Up and running in three steps" />
    </Reveal>
    <ol className="mt-12 grid gap-4 md:grid-cols-3">
      {steps.map(([t, d], i) => (
        <li key={t}>
          <Reveal delay={i * 0.08} className="h-full">
            <div className="h-full rounded-2xl border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  </Section>
);

export const Security = () => (
  <Section id="security">
    <Reveal>
      <Heading
        eyebrow="Privacy & security"
        title="Your finances stay yours"
        sub="Built so you never have to wonder who can see your data."
      />
    </Reveal>
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {[
        [
          ShieldCheck,
          "Secure sign-in",
          "Industry-standard authentication with managed sessions. We never handle your password.",
        ],
        [
          UserCheck,
          "Per-user data isolation",
          "Every request is scoped to your account. Nobody else can read your records.",
        ],
        [
          Download,
          "Export anytime",
          "Download your transactions as CSV whenever you like. No lock-in.",
        ],
      ].map(([Icon, t, d], i) => {
        const I = Icon as LucideIcon;
        return (
          <Reveal key={t as string} delay={i * 0.08} className="[&>div]:h-full">
            <Tile icon={I} title={t as string} text={d as string} />
          </Reveal>
        );
      })}
    </div>
    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <Lock className="size-3.5" /> Encrypted in transit over HTTPS
    </p>
  </Section>
);

const faqs = [
  [
    "Is BudgetBuddy free?",
    "Yes. It is free to use, with no credit card required to sign up.",
  ],
  [
    "Can I import my bank data?",
    "Yes. Import transactions from a CSV export and map the columns once. Bank sync is not included.",
  ],
  [
    "Which currencies are supported?",
    "Pick your display currency in settings and every amount is formatted accordingly.",
  ],
  [
    "What are recurring transactions?",
    "Rules for things like rent, salary or subscriptions. BudgetBuddy creates the transactions automatically on schedule.",
  ],
  [
    "Is my data private?",
    "Yes. Every record is tied to your account and nobody else can see it. You can export your data at any time.",
  ],
  [
    "Does it work on my phone?",
    "Yes. The interface is designed mobile-first and feels like an app on small screens.",
  ],
];

export const Faq = () => (
  <Section id="faq" className="border-t bg-muted/30">
    <Reveal>
      <Heading eyebrow="FAQ" title="Questions, answered" />
    </Reveal>
    <Reveal className="mx-auto mt-10 max-w-2xl divide-y rounded-2xl border bg-card">
      {faqs.map(([q, a]) => (
        <details key={q} className="group px-5 py-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            {q}
            <span
              aria-hidden="true"
              className="text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-4 text-sm text-muted-foreground">{a}</p>
        </details>
      ))}
    </Reveal>
  </Section>
);

export const FinalCta = () => (
  <Section>
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-56 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Take control of your money today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Free forever. Set up in a minute.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-6">
            <Link href="/sign-up">
              Get started free <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Reveal>
  </Section>
);
