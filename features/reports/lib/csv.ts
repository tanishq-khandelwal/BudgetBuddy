import { convertAmountFromMiliunits } from "@/lib/utils";

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: (string | number)[][]) =>
  rows.map((r) => r.map(cell).join(",")).join("\r\n");

export const money = (miliunits: number) =>
  convertAmountFromMiliunits(miliunits).toFixed(2);

export const downloadCsv = (filename: string, csv: string) => {
  // BOM so Excel reads UTF-8 correctly.
  const url = URL.createObjectURL(
    new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
