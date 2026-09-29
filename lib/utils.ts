import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

// `value` is in major units (e.g. 12.5), not miliunits.
export function formatCurrency(
  value: number,
  currency = "USD",
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    // "$" rather than "US$" on non-US locales.
    currencyDisplay: "narrowSymbol",
    ...options,
  }).format(value);
}

export function formatPercentage(value: number, { addPrefix = false } = {}) {
  const result = `${Math.abs(value).toFixed(1)}%`;
  if (!addPrefix) return result;
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${result}`;
}
