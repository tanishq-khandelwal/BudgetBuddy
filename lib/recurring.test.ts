import test from "node:test";
import assert from "node:assert/strict";
import {
  getDueOccurrences,
  nextOccurrences,
  occurrenceAt,
  toMonthlyAmount,
} from "./recurring";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const ymd = (x: Date) => [x.getFullYear(), x.getMonth() + 1, x.getDate()];

test("monthly clamps at month end without drift", () => {
  const s = d(2025, 1, 31);
  assert.deepEqual(ymd(occurrenceAt(s, "monthly", 1)), [2025, 2, 28]);
  assert.deepEqual(ymd(occurrenceAt(s, "monthly", 2)), [2025, 3, 31]);
  assert.deepEqual(ymd(occurrenceAt(s, "monthly", 3)), [2025, 4, 30]);
});

test("leap years", () => {
  assert.deepEqual(
    ymd(occurrenceAt(d(2024, 1, 31), "monthly", 1)),
    [2024, 2, 29],
  );
  const y = d(2024, 2, 29);
  assert.deepEqual(ymd(occurrenceAt(y, "yearly", 1)), [2025, 2, 28]);
  assert.deepEqual(ymd(occurrenceAt(y, "yearly", 4)), [2028, 2, 29]);
});

test("due occurrences stop at end of today and advance nextDate", () => {
  const r = getDueOccurrences({
    startDate: d(2025, 1, 31),
    nextDate: d(2025, 1, 31),
    frequency: "monthly",
    now: d(2025, 3, 31),
  });
  assert.equal(r.dates.length, 3);
  assert.deepEqual(ymd(r.nextDate), [2025, 4, 30]);
});

test("nothing due before nextDate", () => {
  const r = getDueOccurrences({
    startDate: d(2025, 1, 1),
    nextDate: d(2025, 2, 1),
    frequency: "weekly",
    now: d(2025, 1, 20),
  });
  assert.equal(r.dates.length, 0);
});

test("endDate cutoff", () => {
  const r = getDueOccurrences({
    startDate: d(2025, 1, 1),
    nextDate: d(2025, 1, 1),
    endDate: d(2025, 3, 15),
    frequency: "monthly",
    now: d(2025, 12, 1),
  });
  assert.equal(r.dates.length, 3);
  assert.equal(r.finished, true);
});

test("limit cap leaves remainder for next run", () => {
  const r = getDueOccurrences({
    startDate: d(2020, 1, 1),
    nextDate: d(2020, 1, 1),
    frequency: "daily",
    now: d(2025, 1, 1),
    limit: 366,
  });
  assert.equal(r.dates.length, 366);
  assert.deepEqual(
    ymd(r.nextDate),
    ymd(occurrenceAt(d(2020, 1, 1), "daily", 366)),
  );
});

test("weekly, daily, yearly", () => {
  assert.deepEqual(
    ymd(occurrenceAt(d(2025, 1, 1), "weekly", 2)),
    [2025, 1, 15],
  );
  assert.deepEqual(ymd(occurrenceAt(d(2025, 1, 1), "daily", 31)), [2025, 2, 1]);
  const up = nextOccurrences(
    { startDate: d(2025, 6, 1), nextDate: d(2025, 6, 1), frequency: "yearly" },
    3,
  );
  assert.deepEqual(
    up.map((x) => x.getFullYear()),
    [2025, 2026, 2027],
  );
});

test("nextOccurrences honors endDate; monthly amount", () => {
  const up = nextOccurrences(
    {
      startDate: d(2025, 1, 1),
      nextDate: d(2025, 1, 1),
      endDate: d(2025, 2, 10),
      frequency: "monthly",
    },
    5,
  );
  assert.equal(up.length, 2);
  assert.equal(toMonthlyAmount(1200, "yearly"), 100);
  assert.equal(toMonthlyAmount(12, "weekly"), 52);
  assert.ok(Math.abs(toMonthlyAmount(10, "daily") - 304.4) < 1e-9);
});
