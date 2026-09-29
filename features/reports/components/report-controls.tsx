"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import {
  PRESETS,
  activePreset,
  presetRange,
  resolveRange,
  type Preset,
} from "@/features/reports/lib/range";
import { cn } from "@/lib/utils";

const ymd = (d: Date) => format(d, "yyyy-MM-dd");
const day = (s: string) => parse(s, "yyyy-MM-dd", new Date());

// Period + account filters, both stored in the URL (from, to, accountId).
export const ReportControls = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: accounts, isLoading } = useGetAccounts();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const { from, to } = resolveRange(params.get("from"), params.get("to"));
  const accountId = params.get("accountId") || "all";
  const active = activePreset(from, to);

  const push = (next: { from?: string; to?: string; accountId?: string }) =>
    router.push(
      qs.stringifyUrl(
        {
          url: pathname,
          query: {
            from,
            to,
            accountId: accountId === "all" ? undefined : accountId,
            ...next,
          },
        },
        { skipNull: true, skipEmptyString: true },
      ),
    );

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto print:hidden">
      <div
        role="group"
        aria-label="Period"
        className="inline-flex h-10 items-center rounded-lg bg-muted p-1"
      >
        {PRESETS.map((p: Preset) => (
          <button
            key={p}
            type="button"
            aria-pressed={active === p}
            onClick={() => push(presetRange(p))}
            className={cn(
              "h-8 min-w-10 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active === p && "bg-background text-foreground shadow-sm",
            )}
          >
            {p}
          </button>
        ))}
        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (o) setDraft({ from: day(from), to: day(to) });
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-pressed={active === "custom"}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === "custom" &&
                  "bg-background text-foreground shadow-sm",
              )}
            >
              <CalendarIcon className="size-3.5" />
              Custom
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto max-w-[calc(100vw-1rem)] p-0"
          >
            <Calendar
              mode="range"
              numberOfMonths={1}
              defaultMonth={draft?.from}
              selected={draft}
              onSelect={setDraft}
              disabled={{ after: new Date() }}
            />
            <div className="flex items-center justify-between gap-2 border-t p-3">
              <p className="text-xs text-muted-foreground">
                {draft?.from
                  ? `${format(draft.from, "MMM d, yyyy")} – ${format(draft.to ?? draft.from, "MMM d, yyyy")}`
                  : "Select a range"}
              </p>
              <Button
                size="sm"
                disabled={!draft?.from}
                onClick={() => {
                  if (!draft?.from) return;
                  push({
                    from: ymd(draft.from),
                    to: ymd(draft.to ?? draft.from),
                  });
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Select
        value={accountId}
        disabled={isLoading}
        onValueChange={(v) => push({ accountId: v === "all" ? undefined : v })}
      >
        <SelectTrigger
          aria-label="Account"
          className="h-10 w-full sm:w-[180px]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts?.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
