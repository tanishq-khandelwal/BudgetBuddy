import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectDateOrder,
  parseImportAmount,
  parseImportDate,
} from "./import-utils";

const ymd = (d: Date | null) =>
  d && `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

test("dates", () => {
  assert.equal(ymd(parseImportDate("2025-11-03")), "2025-11-3");
  assert.equal(detectDateOrder(["25/12/2025", "03/11/2025"]), "dmy");
  assert.equal(detectDateOrder(["12/25/2025", "03/11/2025"]), "mdy");
  assert.equal(detectDateOrder(["03/11/2025"]), "ambiguous");
  assert.equal(ymd(parseImportDate("03/11/2025", "dmy")), "2025-11-3");
  assert.equal(ymd(parseImportDate("03/11/2025", "mdy")), "2025-3-11");
  assert.equal(parseImportDate("03/11/2025", "ambiguous"), null);
  assert.equal(ymd(parseImportDate("25/11/2025", "ambiguous")), "2025-11-25");
  assert.equal(parseImportDate("2025-02-31"), null);
  assert.equal(parseImportDate("nope"), null);
});

test("amounts", () => {
  assert.equal(parseImportAmount("-125.50"), -125.5);
  assert.equal(parseImportAmount("$1,234.50"), 1234.5);
  assert.equal(parseImportAmount("(45.00)"), -45);
  assert.equal(parseImportAmount("12,50"), 12.5);
  assert.equal(parseImportAmount("abc"), null);
  assert.equal(parseImportAmount(""), null);
});
