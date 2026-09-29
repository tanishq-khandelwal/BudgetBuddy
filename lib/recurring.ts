import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  endOfDay,
  startOfDay,
} from "date-fns";

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type RuleSchedule = {
  startDate: Date;
  nextDate: Date;
  endDate?: Date | null;
  frequency: Frequency;
};

const add = {
  daily: addDays,
  weekly: addWeeks,
  monthly: addMonths,
  yearly: addYears,
} as const;

/**
 * The index-th occurrence, always computed from startDate (never by chaining),
 * so a Jan 31 monthly rule goes Jan 31 -> Feb 28 -> Mar 31 without drift.
 */
export const occurrenceAt = (
  startDate: Date,
  frequency: Frequency,
  index: number,
) => add[frequency](startDate, index);

const diff = {
  daily: differenceInCalendarDays,
  weekly: differenceInCalendarWeeks,
  monthly: differenceInCalendarMonths,
  yearly: differenceInCalendarYears,
} as const;

/** Index of the first occurrence at or after `date`. */
export const firstIndexOnOrAfter = (
  startDate: Date,
  frequency: Frequency,
  date: Date,
) => {
  // Calendar diffs can overshoot by one period; step back, then walk forward.
  let i = Math.max(0, diff[frequency](date, startDate) - 1);
  while (occurrenceAt(startDate, frequency, i) < date) i++;
  return i;
};

/**
 * Occurrences in [nextDate, min(now, endDate)] (now = end of today), capped at
 * `limit`, plus the nextDate to store afterwards (first occurrence not included).
 */
export const getDueOccurrences = ({
  startDate,
  nextDate,
  endDate,
  frequency,
  now,
  limit = 366,
}: RuleSchedule & { now: Date; limit?: number }) => {
  const cutoff = endOfDay(now);
  const dates: Date[] = [];
  let i = firstIndexOnOrAfter(startDate, frequency, nextDate);
  let next = occurrenceAt(startDate, frequency, i);

  while (
    dates.length < limit &&
    next <= cutoff &&
    (!endDate || next <= endDate)
  ) {
    dates.push(next);
    i++;
    next = occurrenceAt(startDate, frequency, i);
  }

  return { dates, nextDate: next, finished: !!endDate && next > endDate };
};

/** The next `count` occurrences from nextDate, honoring endDate. */
export const nextOccurrences = (rule: RuleSchedule, count: number) => {
  const dates: Date[] = [];
  let i = firstIndexOnOrAfter(rule.startDate, rule.frequency, rule.nextDate);
  while (dates.length < count) {
    const d = occurrenceAt(rule.startDate, rule.frequency, i++);
    if (rule.endDate && d > rule.endDate) break;
    dates.push(d);
  }
  return dates;
};

/** First occurrence on or after today's start (used when a schedule is edited). */
export const firstOccurrenceFrom = (
  startDate: Date,
  frequency: Frequency,
  from: Date,
) =>
  occurrenceAt(
    startDate,
    frequency,
    firstIndexOnOrAfter(startDate, frequency, startOfDay(from)),
  );

/** Amount normalised to a monthly figure (same unit as input). */
export const toMonthlyAmount = (amount: number, frequency: Frequency) => {
  switch (frequency) {
    case "daily":
      return amount * 30.44;
    case "weekly":
      return (amount * 52) / 12;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
};
