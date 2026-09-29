"use client";

import { useState, useSyncExternalStore } from "react";
import { format, parse, subDays, startOfMonth, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const PRESETS = [
  {
    key: "thisMonth",
    label: "This month",
    from: () => startOfMonth(new Date()),
  },
  { key: "last7", label: "Last 7 days", from: () => subDays(new Date(), 6) },
  { key: "last30", label: "Last 30 days", from: () => subDays(new Date(), 29) },
  { key: "last90", label: "Last 90 days", from: () => subDays(new Date(), 89) },
] as const;

const DESKTOP_QUERY = "(min-width: 768px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );

const parseParam = (value: string) => parse(value, "yyyy-MM-dd", new Date());

export const DateFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<DateRange | undefined>();

  const accountId = params.get("accountId");
  const fromParam = params.get("from");
  const toParam = params.get("to");

  // No params = start of month -> today, same as the API default.
  const today = new Date();
  const from = fromParam ? parseParam(fromParam) : startOfMonth(today);
  const to = toParam ? parseParam(toParam) : today;

  const activePreset = PRESETS.find(
    (p) => isSameDay(p.from(), from) && isSameDay(today, to),
  );

  const label = activePreset
    ? activePreset.label
    : `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;

  const apply = (range: { from: Date; to: Date }) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          from: format(range.from, "yyyy-MM-dd"),
          to: format(range.to, "yyyy-MM-dd"),
          accountId,
        },
      },
      { skipEmptyString: true, skipNull: true },
    );
    router.push(url);
    setOpen(false);
  };

  const panel = (
    <div className="flex flex-col md:flex-row">
      <div
        role="listbox"
        aria-label="Date presets"
        className="flex gap-1 overflow-x-auto p-2 md:w-44 md:flex-col md:overflow-visible md:border-r"
      >
        {PRESETS.map((p) => {
          const selected = activePreset?.key === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => apply({ from: p.from(), to: new Date() })}
              className={cn(
                "flex h-10 shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-accent font-medium",
              )}
            >
              {p.label}
              {selected && <Check className="hidden size-4 md:block" />}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center p-2">
        <Calendar
          mode="range"
          defaultMonth={subDays(to, 30)}
          selected={pending ?? { from, to }}
          onSelect={(range) => {
            setPending(range);
            if (range?.from && range?.to)
              apply({ from: range.from, to: range.to });
          }}
          numberOfMonths={isDesktop ? 2 : 1}
          disabled={{ after: today }}
        />
        <p className="pb-2 text-xs text-muted-foreground">
          Pick a start and end date for a custom range
        </p>
      </div>
    </div>
  );

  const trigger = (
    <Button
      variant="outline"
      className="h-10 w-full justify-start gap-2 px-3 font-normal sm:w-auto sm:min-w-[210px]"
      aria-label={`Date range: ${label}`}
    >
      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
      <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
    </Button>
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPending(undefined);
  };

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="pb-6">
          <DrawerHeader>
            <DrawerTitle>Date range</DrawerTitle>
          </DrawerHeader>
          {panel}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {panel}
      </PopoverContent>
    </Popover>
  );
};
