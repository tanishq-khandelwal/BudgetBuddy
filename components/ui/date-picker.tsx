"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value?: Date;
  onChange?: SelectSingleEventHandler;
  disabled?: boolean;
  id?: string;
};

export const DatePicker = ({ value, onChange, disabled, id }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start px-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
          {value ? format(value, "EEE, d MMM yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(...args) => {
            onChange?.(...args);
            setOpen(false);
          }}
          defaultMonth={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
