export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "INR", label: "Indian Rupee" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "AED", label: "UAE Dirham" },
  { code: "CHF", label: "Swiss Franc" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];
