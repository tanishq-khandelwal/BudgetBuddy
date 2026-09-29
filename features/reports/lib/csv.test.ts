import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv";

test("toCsv escapes quotes, commas and newlines", () => {
  assert.equal(
    toCsv([["a,b", 'say "hi"', "x\ny", 1]]),
    '"a,b","say ""hi""","x\ny",1',
  );
});
