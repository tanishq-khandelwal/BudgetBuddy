"use client";

import { Suspense, useState, useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Download,
  Info,
  LogOut,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { cn, formatCurrency } from "@/lib/utils";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { useUpdateSettings } from "@/features/settings/api/use-update-settings";
import { useGetDataStats } from "@/features/settings/api/use-get-data-stats";
import { useExportData } from "@/features/settings/api/use-export-data";
import { useDeleteAllData } from "@/features/settings/api/use-delete-all-data";

const APP_VERSION = "1.0.0";

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "data", label: "Data & privacy", icon: ShieldCheck },
  { id: "about", label: "About", icon: Info },
];

const Row = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="min-w-0 space-y-0.5">
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <div className="sm:shrink-0">{children}</div>
  </div>
);

const Section = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn("shadow-sm", className)}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="divide-y">{children}</CardContent>
  </Card>
);

const ProfileSection = () => {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  return (
    <Section
      title="Profile"
      description="Your account details, managed securely by Clerk."
    >
      <div className="flex items-center gap-4 pb-4">
        {!isLoaded ? (
          <>
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="size-16">
              <AvatarImage src={user?.imageUrl} alt="" />
              <AvatarFallback>
                {(user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {user?.fullName ?? "Your account"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </>
        )}
      </div>
      <Row label="Member since">
        {isLoaded && user?.createdAt ? (
          <span className="text-sm text-muted-foreground">
            {format(user.createdAt, "MMMM d, yyyy")}
          </span>
        ) : (
          <Skeleton className="h-4 w-28" />
        )}
      </Row>
      <Row
        label="Account & security"
        description="Name, email, password, two-factor authentication and connected accounts."
      >
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          onClick={() => clerk.openUserProfile()}
        >
          Manage account
        </Button>
      </Row>
      <Row
        label="Sign out"
        description="Sign out of BudgetBuddy on this device."
      >
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          onClick={() => clerk.signOut({ redirectUrl: "/" })}
        >
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </Row>
    </Section>
  );
};

const CurrencyPicker = () => {
  const { data, isLoading } = useGetSettings();
  const update = useUpdateSettings();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const current = data?.currency ?? "USD";

  const choose = (code: string) => {
    setOpen(false);
    if (code === current) return;
    // Optimistic: reflect immediately, roll back on failure.
    queryClient.setQueryData(["settings"], { currency: code });
    update.mutate(
      { currency: code },
      {
        onError: () =>
          queryClient.setQueryData(["settings"], { currency: current }),
      },
    );
  };

  if (isLoading) return <Skeleton className="h-10 w-full sm:w-64" />;

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Currency"
            className="h-10 w-full justify-between sm:w-64"
          >
            <span className="truncate">
              {current} ·{" "}
              {SUPPORTED_CURRENCIES.find((c) => c.code === current)?.label}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 sm:w-64"
          align="end"
        >
          <Command>
            <CommandInput placeholder="Search currency..." />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.code} ${c.label}`}
                    onSelect={() => choose(c.code)}
                    className="min-h-10"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        c.code === current ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="font-medium">{c.code}</span>
                    <span className="ml-2 truncate text-muted-foreground">
                      {c.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Preview: 1,234.56 →{" "}
        <span className="font-medium text-foreground">
          {formatCurrency(1234.56, current)}
        </span>
      </p>
    </div>
  );
};

// Mini UI mock-ups drawn with hard-coded light/dark palettes (independent of the active theme).
const ThemePreview = ({ mode }: { mode: "light" | "dark" }) => {
  const dark = mode === "dark";
  return (
    <div
      className={cn(
        "flex h-full w-full gap-1.5 p-2",
        dark ? "bg-zinc-900" : "bg-zinc-100",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "w-1/4 space-y-1 rounded p-1",
          dark ? "bg-zinc-800" : "bg-white",
        )}
      >
        <div className="h-1 w-full rounded-full bg-emerald-500" />
        <div
          className={cn(
            "h-1 w-3/4 rounded-full",
            dark ? "bg-zinc-600" : "bg-zinc-300",
          )}
        />
        <div
          className={cn(
            "h-1 w-2/3 rounded-full",
            dark ? "bg-zinc-600" : "bg-zinc-300",
          )}
        />
      </div>
      <div className="flex-1 space-y-1">
        <div
          className={cn(
            "h-1.5 w-1/3 rounded-full",
            dark ? "bg-zinc-500" : "bg-zinc-400",
          )}
        />
        <div className="grid grid-cols-2 gap-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn("h-5 rounded", dark ? "bg-zinc-800" : "bg-white")}
            />
          ))}
        </div>
        <div className={cn("h-6 rounded", dark ? "bg-zinc-800" : "bg-white")} />
      </div>
    </div>
  );
};

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

const noopSubscribe = () => () => {};

const ThemePicker = () => {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3"
    >
      {THEMES.map(({ id, label, icon: Icon }) => {
        const selected = mounted && theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(id)}
            className={cn(
              "group rounded-xl border bg-card p-2 text-left transition-all hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected && "border-primary ring-2 ring-primary",
            )}
          >
            <div className="h-20 overflow-hidden rounded-lg border">
              {id === "system" ? (
                <div className="flex h-full">
                  <div className="w-1/2 overflow-hidden">
                    <ThemePreview mode="light" />
                  </div>
                  <div className="w-1/2 overflow-hidden">
                    <ThemePreview mode="dark" />
                  </div>
                </div>
              ) : (
                <ThemePreview mode={id} />
              )}
            </div>
            <div className="flex items-center justify-between px-1 pb-0.5 pt-2 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" /> {label}
              </span>
              {selected && <Check className="size-4 text-primary" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const PreferencesSection = () => (
  <div className="space-y-6">
    <Section
      title="Currency"
      description="Used to display every amount across BudgetBuddy."
    >
      <Row
        label="Display currency"
        description="Stored amounts don't change, only how they're shown."
      >
        <CurrencyPicker />
      </Row>
    </Section>
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>
          Choose how BudgetBuddy looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ThemePicker />
      </CardContent>
    </Card>
  </div>
);

const STAT_LABELS = [
  ["accounts", "Accounts"],
  ["categories", "Categories"],
  ["transactions", "Transactions"],
  ["budgets", "Budgets"],
  ["recurring", "Recurring"],
] as const;

const DataSection = () => {
  const stats = useGetDataStats();
  const exportData = useExportData();
  const del = useDeleteAllData();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your data</CardTitle>
          <CardDescription>
            Everything BudgetBuddy stores about your finances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {STAT_LABELS.map(([key, label]) => (
              <div key={key} className="rounded-lg border bg-muted/30 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {stats.data ? (
                    stats.data[key]
                  ) : (
                    <Skeleton className="h-8 w-10" />
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="divide-y">
            <Row
              label="Export all data"
              description="Download a JSON file with all your accounts, transactions, budgets and more."
            >
              <Button
                variant="outline"
                className="h-10 w-full sm:w-auto"
                disabled={exportData.isPending}
                onClick={() => exportData.mutate()}
              >
                <Download className="mr-2 size-4" />
                {exportData.isPending
                  ? "Preparing..."
                  : "Export all data (JSON)"}
              </Button>
            </Row>
            <Row
              label="Import transactions"
              description="Bring in transactions from a CSV file."
            >
              <Button
                variant="outline"
                className="h-10 w-full sm:w-auto"
                asChild
              >
                <Link href="/transactions">
                  <Upload className="mr-2 size-4" /> Import from CSV
                </Link>
              </Button>
            </Row>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>Irreversible actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Row
            label="Delete all data"
            description="Permanently delete every account, category, transaction, budget and recurring rule. Your currency setting is kept."
          >
            <Button
              variant="destructive"
              className="h-10 w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <Trash2 className="mr-2 size-4" /> Delete all data
            </Button>
          </Row>
        </CardContent>
      </Card>

      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setConfirm("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all your financial data and cannot be
              undone. Consider exporting first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-semibold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              className="h-10"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="h-10"
              disabled={confirm !== "DELETE" || del.isPending}
              onClick={() =>
                del.mutate(undefined, {
                  onSuccess: () => {
                    setOpen(false);
                    setConfirm("");
                  },
                })
              }
            >
              {del.isPending ? "Deleting..." : "Delete everything"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AboutSection = () => (
  <Section title="About" description="BudgetBuddy, a personal finance tracker.">
    <Row label="Version">
      <span className="font-mono text-sm text-muted-foreground">
        v{APP_VERSION}
      </span>
    </Row>
    <Row
      label="Quick search"
      description="Jump to any page or action from anywhere."
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        Press
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
        <span className="text-xs">(Ctrl+K on Windows)</span>
      </span>
    </Row>
    <Row label="Privacy">
      <p className="max-w-md text-sm text-muted-foreground sm:text-right">
        Your financial data is private to your account. We never sell it or
        share it with third parties, and you can export or delete it at any time
        from Data &amp; privacy.
      </p>
    </Row>
  </Section>
);

const CONTENT: Record<string, () => JSX.Element> = {
  profile: ProfileSection,
  preferences: PreferencesSection,
  data: DataSection,
  about: AboutSection,
};

const SettingsContent = () => {
  const tabParam = useSearchParams().get("tab") ?? "";
  const active = tabParam in CONTENT ? tabParam : "profile";
  const Active = CONTENT[active];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences and data."
      />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <nav
          aria-label="Settings sections"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/settings?tab=${id}`}
              scroll={false}
              replace
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 max-w-3xl">
          <Active />
        </div>
      </div>
    </>
  );
};

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
