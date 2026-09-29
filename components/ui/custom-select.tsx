"use client";

import { useMemo } from "react";
import { SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

type Props = {
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: Option[];
  value?: string | null | undefined;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
};

// react-select, fully restyled with theme tokens so it matches shadcn inputs
// in light and dark mode.
export const CustomSelect = ({
  value,
  onChange,
  disabled,
  onCreate,
  options = [],
  placeholder,
  id,
  "aria-invalid": invalid,
}: Props) => {
  const formattedValue = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <CreatableSelect<Option, false>
      inputId={id}
      unstyled
      placeholder={placeholder}
      value={formattedValue}
      onChange={(option: SingleValue<Option>) => onChange(option?.value)}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
      isClearable
      aria-invalid={invalid}
      formatCreateLabel={(input) => `Create "${input}"`}
      classNames={{
        control: (s) =>
          cn(
            "min-h-10 w-full rounded-md border bg-background px-3 text-sm transition-colors",
            s.isFocused
              ? "border-transparent ring-2 ring-ring ring-offset-2 ring-offset-background"
              : "border-input hover:border-ring/50",
            invalid && "border-destructive",
            s.isDisabled && "cursor-not-allowed opacity-50",
          ),
        valueContainer: () => "gap-1 py-1",
        placeholder: () => "text-muted-foreground",
        singleValue: () => "text-foreground",
        input: () => "text-foreground",
        indicatorsContainer: () => "gap-1",
        clearIndicator: () =>
          "rounded p-1 text-muted-foreground hover:text-foreground",
        dropdownIndicator: () =>
          "rounded p-1 text-muted-foreground hover:text-foreground",
        indicatorSeparator: () => "hidden",
        menu: () =>
          "z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        menuList: () => "p-1",
        option: (s) =>
          cn(
            "cursor-pointer rounded-sm px-2 py-2 text-sm",
            s.isFocused && "bg-accent text-accent-foreground",
            s.isSelected && "font-medium",
          ),
        noOptionsMessage: () => "px-2 py-3 text-sm text-muted-foreground",
      }}
    />
  );
};
