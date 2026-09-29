// Pure helpers for the CSV import flow (parsing dates and amounts).

export type DateOrder = "dmy" | "mdy" | "ambiguous";

const ISO = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const SLASHED = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;

/**
 * Decides whether dd/MM/yyyy or MM/dd/yyyy is meant by looking at the whole
 * column: a first part > 12 means day-first, a second part > 12 means
 * month-first. All-≤12 (or conflicting) columns are "ambiguous".
 */
export const detectDateOrder = (values: string[]): DateOrder => {
  let dmy = false;
  let mdy = false;
  for (const value of values) {
    const m = SLASHED.exec(value.trim());
    if (!m) continue;
    if (+m[1] > 12) dmy = true;
    if (+m[2] > 12) mdy = true;
  }
  return dmy && !mdy ? "dmy" : mdy && !dmy ? "mdy" : "ambiguous";
};

const build = (y: number, m: number, d: number) => {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
    ? date
    : null;
};

/** Accepts yyyy-MM-dd (documented), dd/MM/yyyy and MM/dd/yyyy. Null if invalid or ambiguous. */
export const parseImportDate = (
  value: string,
  order: DateOrder = "ambiguous",
): Date | null => {
  const s = value.trim();
  const iso = ISO.exec(s);
  if (iso) return build(+iso[1], +iso[2], +iso[3]);

  const m = SLASHED.exec(s);
  if (!m) return null;
  const a = +m[1];
  const b = +m[2];
  const y = +m[3];
  if (order === "dmy") return build(y, b, a);
  if (order === "mdy") return build(y, a, b);
  // Ambiguous column: only rows that can be read one way are accepted.
  if (a > 12) return build(y, b, a);
  if (b > 12) return build(y, a, b);
  return null;
};

/** "$1,234.50" -> 1234.5, "(45.00)" / "-45" -> negative, "12,50" -> 12.5. Null if not a number. */
export const parseImportAmount = (value: string): number | null => {
  const s = value.trim();
  if (!s) return null;
  const negative = /^\(.*\)$/.test(s) || /^[^\d]*-/.test(s);
  let digits = s.replace(/[^\d.,]/g, "");
  if (!/\d/.test(digits)) return null;
  if (digits.includes(",") && digits.includes(".")) {
    digits = digits.replace(/,/g, "");
  } else if (/,\d{1,2}$/.test(digits) && !digits.includes(".")) {
    digits = digits.replace(",", ".");
  } else {
    digits = digits.replace(/,/g, "");
  }
  const n = parseFloat(digits);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : Math.abs(n);
};
