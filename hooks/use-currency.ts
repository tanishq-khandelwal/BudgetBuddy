import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";

// The user's display currency, plus formatters bound to it. Use this for every
// amount shown in the UI instead of hardcoding "USD".
export const useCurrency = () => {
  const { data } = useGetSettings();
  const currency = data?.currency ?? "USD";

  return {
    currency,
    /** Formats a major-unit value, e.g. 12.5 → "$12.50". */
    format: (value: number, options?: Intl.NumberFormatOptions) =>
      formatCurrency(value, currency, options),
    /** Formats a stored miliunit amount, e.g. 12500 → "$12.50". */
    formatMiliunits: (amount: number, options?: Intl.NumberFormatOptions) =>
      formatCurrency(convertAmountFromMiliunits(amount), currency, options),
  };
};
