"use client";

import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DateFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const accountId = params.get("accountId");
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = startOfMonth(defaultTo);

  const [date, setDate] = useState<DateRange | undefined>({
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  });

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      accountId,
    };

    const url = qs.stringifyUrl(
      { url: pathname, query },
      { skipEmptyString: true, skipNull: true },
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  const onRangeChange = (range: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;

    switch (range) {
      case "last7":
        newRange = { from: subDays(today, 7), to: today };
        break;
      case "last30":
        newRange = { from: subDays(today, 30), to: today };
        break;
      case "last90":
        newRange = { from: subDays(today, 90), to: today };
        break;
      case "thisMonth":
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case "custom":
        return;
      default:
        newRange = { from: startOfMonth(today), to: today };
    }

    setDate(newRange);
    pushToUrl(newRange);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
      <div className="flex flex-col gap-1.5 w-full lg:w-auto">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Date Range
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full lg:w-[300px] justify-start text-left font-normal bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM dd, yyyy")} -{" "}
                    {format(date.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(date.from, "MMM dd, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                if (newDate?.from && newDate?.to) {
                  pushToUrl(newDate);
                }
              }}
              numberOfMonths={2}
              className="rounded-md"
            />
            <div className="p-3 border-t bg-gray-50">
              {date?.from && date?.to && (
                <div className="mb-2 text-sm text-center text-gray-700">
                  <span className="font-semibold">
                    {format(date.from, "MMM dd, yyyy")}
                  </span>
                  {" to "}
                  <span className="font-semibold">
                    {format(date.to, "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              <Button onClick={onReset} variant="outline" className="w-full">
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
