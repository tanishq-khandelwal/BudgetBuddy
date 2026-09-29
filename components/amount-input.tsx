"use client";

import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

type Props = {
  /** Signed decimal string: negative = expense, positive = income. */
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** false = plain positive amount field, no income/expense toggle. Default true. */
  allowNegative?: boolean;
};

type Mode = "income" | "expense";

// Income/expense segmented toggle + amount field. Emits a signed string so the
// rest of the app (forms, miliunit conversion) keeps working unchanged.
export const AmountInput = ({
  value,
  onChange,
  placeholder = "0.00",
  disabled,
  id,
  allowNegative = true,
}: Props) => {
  const { currency } = useCurrency();
  const [emptyMode, setEmptyMode] = useState<Mode>("expense");

  const raw = (value ?? "").replace(/^-/, "");
  const mode: Mode = !allowNegative
    ? "income"
    : value?.startsWith("-")
      ? "expense"
      : raw
        ? "income"
        : emptyMode;

  const symbol =
    new Intl.NumberFormat(undefined, { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "";

  const emit = (text: string, m: Mode) =>
    onChange(text ? (m === "expense" ? `-${text}` : text) : "");

  const options: { mode: Mode; label: string; Icon: typeof ArrowUpRight }[] = [
    { mode: "expense", label: "Expense", Icon: ArrowDownRight },
    { mode: "income", label: "Income", Icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-2">
      {allowNegative && (
        <div
          role="radiogroup"
          aria-label="Transaction type"
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          {options.map(({ mode: m, label, Icon }) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => {
                  setEmptyMode(m);
                  emit(raw, m);
                }}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  active
                    ? m === "income"
                      ? "bg-background text-success shadow-sm"
                      : "bg-background text-destructive shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      )}

      <CurrencyInput
        id={id}
        prefix={symbol}
        allowNegativeValue={false}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 text-lg font-semibold tabular-nums ring-offset-background placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          allowNegative && mode === "income"
            ? "text-success"
            : "text-foreground",
        )}
        placeholder={`${symbol}${placeholder}`}
        value={raw}
        decimalsLimit={2}
        decimalScale={2}
        inputMode="decimal"
        onValueChange={(v) => emit(v ?? "", mode)}
        disabled={disabled}
      />
    </div>
  );
};
