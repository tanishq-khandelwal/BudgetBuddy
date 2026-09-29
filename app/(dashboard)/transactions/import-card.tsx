"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { useCurrency } from "@/hooks/use-currency";
import { cn, convertAmountToMiliunits } from "@/lib/utils";
import {
  detectDateOrder,
  parseImportAmount,
  parseImportDate,
} from "./import-utils";
import { SampleCsvLink, UploadDropzone } from "./upload-button";

type Field = "date" | "payee" | "amount" | "notes";

const FIELDS: { key: Field; label: string; required: boolean }[] = [
  { key: "date", label: "Date", required: true },
  { key: "payee", label: "Payee", required: true },
  { key: "amount", label: "Amount", required: true },
  { key: "notes", label: "Notes", required: false },
];
const REQUIRED = FIELDS.filter((f) => f.required);

const STEPS = ["Upload", "Map columns", "Pick rows", "Import"];

const GUESSES: [Field, RegExp][] = [
  ["date", /date|day|when/i],
  ["amount", /amount|value|sum|total|debit|credit/i],
  ["payee", /payee|merchant|description|name|vendor|title/i],
  ["notes", /note|memo|comment|detail/i],
];

// Best-effort column mapping from the CSV header names.
const guessMapping = (headers: string[]) => {
  const mapping: Record<number, Field> = {};
  const used = new Set<Field>();
  headers.forEach((header, index) => {
    const hit = GUESSES.find(([f, re]) => !used.has(f) && re.test(header));
    if (hit) {
      mapping[index] = hit[0];
      used.add(hit[0]);
    }
  });
  return mapping;
};

type ImportedRow = {
  date: Date;
  payee: string;
  amount: number; // miliunits
  notes: string | null;
};

type Props = {
  /** Parsed CSV (first row = headers). Empty shows the upload step. */
  data: string[][];
  onUpload: (results: { data: string[][] }) => void;
  onCancel: () => void;
  onSubmit: (rows: ImportedRow[]) => void;
  submitting?: boolean;
};

const Stepper = ({ current }: { current: number }) => (
  <nav aria-label="Import progress" className="mb-6">
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-2",
              i < STEPS.length - 1 && "flex-1",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-sm font-medium",
                active ? "inline" : "hidden sm:inline",
                !active && !done && "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export const ImportCard = ({
  data,
  onUpload,
  onCancel,
  onSubmit,
  submitting,
}: Props) => {
  const headers = data[0] ?? [];
  const body = useMemo(
    () =>
      data
        .slice(1)
        .filter((row) => row.some((cell) => cell && cell.trim() !== "")),
    [data],
  );

  const [step, setStep] = useState<1 | 2>(1); // 1 = map columns, 2 = pick rows
  const [mapping, setMapping] = useState<Record<number, Field>>(() =>
    guessMapping(headers),
  );
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const { format: formatMoney } = useCurrency();

  const columnOf = (field: Field) => {
    const i = Object.entries(mapping).find(([, f]) => f === field)?.[0];
    return i === undefined ? -1 : Number(i);
  };
  const mappedRequired = REQUIRED.filter((f) => columnOf(f.key) >= 0).length;
  const allMapped = mappedRequired === REQUIRED.length;

  const setColumnField = (index: number, value: string) => {
    setMapping((prev) => {
      const next: Record<number, Field> = {};
      for (const [k, f] of Object.entries(prev)) {
        if (f !== value) next[Number(k)] = f; // a field maps to one column only
      }
      if (value !== "skip") next[index] = value as Field;
      else delete next[index];
      return next;
    });
  };

  // Parsed rows + per-row problems, computed once columns are mapped.
  const parsed = useMemo(() => {
    if (!allMapped) return [];
    const d = columnOf("date");
    const p = columnOf("payee");
    const a = columnOf("amount");
    const n = columnOf("notes");
    const order = detectDateOrder(body.map((r) => r[d] ?? ""));
    return body.map((row, index) => {
      const date = parseImportDate(row[d] ?? "", order);
      const amount = parseImportAmount(row[a] ?? "");
      const payee = (row[p] ?? "").trim();
      const problems = [
        !date &&
          ((row[d] ?? "").trim()
            ? "Unrecognised or ambiguous date. Use yyyy-MM-dd"
            : "Missing date"),
        !payee && "Missing payee",
        amount === null && "Invalid amount",
      ].filter(Boolean) as string[];
      return {
        index,
        date,
        amount,
        payee,
        notes: n >= 0 ? (row[n] ?? "").trim() || null : null,
        problems,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMapped, body, mapping]);

  const selected = parsed.filter((r) => !excluded.has(r.index));
  const allSelected = parsed.length > 0 && selected.length === parsed.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () =>
    setExcluded(allSelected ? new Set(parsed.map((r) => r.index)) : new Set());
  const toggleRow = (index: number) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const handleImport = () => {
    const bad = selected.filter((r) => r.problems.length);
    if (bad.length) {
      const list = bad
        .slice(0, 5)
        .map((r) => `Row ${r.index + 2}: ${r.problems[0]}`)
        .join("\n");
      toast.error(
        `${bad.length} selected row${bad.length === 1 ? " has" : "s have"} problems`,
        {
          description: `${list}${bad.length > 5 ? `\n…and ${bad.length - 5} more` : ""}\nFix the CSV or untick those rows.`,
          style: { whiteSpace: "pre-line" },
        },
      );
      return;
    }
    if (!selected.length) {
      toast.error("Select at least one row to import.");
      return;
    }
    onSubmit(
      selected.map((r) => ({
        date: r.date as Date,
        payee: r.payee,
        amount: convertAmountToMiliunits(r.amount as number),
        notes: r.notes,
      })),
    );
  };

  const current = data.length === 0 ? 0 : submitting ? 3 : step + 1;

  return (
    <>
      <PageHeader
        title="Import transactions"
        description="Bring in transactions from a CSV file in a few steps."
        actions={
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        }
      />
      <Stepper current={current} />

      {data.length === 0 && (
        <section className="space-y-4">
          <UploadDropzone onUpload={onUpload} />
          <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Your CSV needs a header row with a{" "}
              <span className="font-medium text-foreground">date</span>{" "}
              (yyyy-MM-dd, dd/MM/yyyy or MM/dd/yyyy),{" "}
              <span className="font-medium text-foreground">payee</span> and{" "}
              <span className="font-medium text-foreground">amount</span>{" "}
              (negative for expenses).
            </p>
            <SampleCsvLink />
          </div>
        </section>
      )}

      {data.length > 0 && step === 1 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Map your columns</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what each column in your file contains. {body.length}{" "}
                row{body.length === 1 ? "" : "s"} found.
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.5" aria-label="Required fields">
              {FIELDS.map((f) => {
                const ok = columnOf(f.key) >= 0;
                return (
                  <li
                    key={f.key}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                      ok
                        ? "border-success/30 bg-success/10 text-success"
                        : "text-muted-foreground",
                    )}
                  >
                    {ok && <Check className="size-3" />}
                    {f.label}
                    {!f.required && " (optional)"}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {headers.map((header, index) => (
              <div
                key={index}
                className={cn(
                  "space-y-3 rounded-xl border bg-card p-4 transition-colors",
                  mapping[index] && "border-primary/40",
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Column {index + 1}
                  </p>
                  <p className="truncate font-medium">
                    {header || "(no header)"}
                  </p>
                </div>
                <ul className="space-y-1 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {body.slice(0, 3).map((row, i) => (
                    <li key={i} className="truncate">
                      {row[index] || <span className="italic">empty</span>}
                    </li>
                  ))}
                </ul>
                <Select
                  value={mapping[index] ?? "skip"}
                  onValueChange={(v) => setColumnField(index, v)}
                >
                  <SelectTrigger
                    aria-label={`Field for column ${header || index + 1}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="skip">Skip this column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-muted-foreground">
              {mappedRequired} of {REQUIRED.length} required fields mapped
            </p>
            <Button disabled={!allMapped} onClick={() => setStep(2)}>
              Continue <ArrowRight />
            </Button>
          </div>
        </section>
      )}

      {data.length > 0 && step === 2 && (
        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <label className="-m-2 flex size-10 items-center justify-center">
                <Checkbox
                  checked={allSelected || (someSelected && "indeterminate")}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </label>
              <p className="text-sm font-medium">
                {selected.length} of {parsed.length} selected
              </p>
            </div>
            <ul className="max-h-[55vh] divide-y overflow-y-auto">
              {parsed.map((r) => {
                const checked = !excluded.has(r.index);
                return (
                  <li
                    key={r.index}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 transition-opacity",
                      !checked && "opacity-50",
                    )}
                  >
                    <label className="-m-2 flex size-10 shrink-0 items-center justify-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRow(r.index)}
                        aria-label={`Select row ${r.index + 2}`}
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.payee || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.date ? format(r.date, "d MMM yyyy") : "No date"}
                        {r.notes && ` · ${r.notes}`}
                      </p>
                      {r.problems.length > 0 && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                          <TriangleAlert className="size-3 shrink-0" />
                          {r.problems.join(" · ")}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-medium tabular-nums",
                        r.amount !== null && r.amount > 0 && "text-success",
                      )}
                    >
                      {r.amount === null
                        ? "—"
                        : `${r.amount > 0 ? "+" : ""}${formatMoney(r.amount)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              <ArrowLeft /> Back
            </Button>
            <Button
              disabled={selected.length === 0 || submitting}
              onClick={handleImport}
            >
              {submitting && <Loader2 className="animate-spin" />}
              Import {selected.length} transaction
              {selected.length === 1 ? "" : "s"}
            </Button>
          </div>
        </section>
      )}
    </>
  );
};
