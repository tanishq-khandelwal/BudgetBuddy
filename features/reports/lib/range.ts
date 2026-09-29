import { format, startOfMonth, startOfYear, subMonths } from "date-fns";

export const PRESETS = ["3M", "6M", "12M", "YTD"] as const;
export type Preset = (typeof PRESETS)[number];

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export const presetRange = (preset: Preset, today = new Date()) => {
  const start =
    preset === "YTD"
      ? startOfYear(today)
      : startOfMonth(subMonths(today, Number.parseInt(preset) - 1));
  return { from: fmt(start), to: fmt(today) };
};

// No URL params means the default 12M window.
export const resolveRange = (from?: string | null, to?: string | null) => ({
  ...presetRange("12M"),
  ...(from ? { from } : {}),
  ...(to ? { to } : {}),
});

export const activePreset = (from: string, to: string): Preset | "custom" =>
  PRESETS.find((p) => {
    const r = presetRange(p);
    return r.from === from && r.to === to;
  }) ?? "custom";
