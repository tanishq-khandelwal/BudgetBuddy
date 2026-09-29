"use client";

import { useState } from "react";
import { Download, FileText, Printer, Table2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client } from "@/lib/hono";
import { downloadCsv, money, toCsv } from "@/features/reports/lib/csv";
import type { Report } from "@/features/reports/api/use-get-report";

type Props = {
  report?: Report;
  from: string;
  to: string;
  accountId?: string;
};

export const ExportMenu = ({ report, from, to, accountId }: Props) => {
  const [busy, setBusy] = useState(false);

  const exportSummary = () => {
    if (!report) return;
    const rows: (string | number)[][] = [
      ["Monthly summary"],
      ["Month", "Income", "Expenses", "Net"],
      ...report.monthly.map((m) => [
        m.month,
        money(m.income),
        money(m.expenses),
        money(m.net),
      ]),
      [],
      ["Spending by category"],
      ["Category", "Amount", "Share %", "Transactions"],
      ...report.categories.map((c) => [
        c.name,
        money(c.amount),
        c.share.toFixed(1),
        c.count,
      ]),
    ];
    downloadCsv(`bb-summary-${from}-to-${to}.csv`, toCsv(rows));
  };

  const exportTransactions = async () => {
    setBusy(true);
    try {
      const res = await client.api.transactions.$get({
        query: { from, to, accountId },
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      const rows: (string | number)[][] = [
        ["Date", "Payee", "Category", "Account", "Amount"],
        ...data.map((t) => [
          format(new Date(t.date), "yyyy-MM-dd"),
          t.payee,
          t.category ?? "Uncategorized",
          t.account,
          money(t.amount),
        ]),
      ];
      downloadCsv(`bb-transactions-${from}-to-${to}.csv`, toCsv(rows));
    } catch {
      toast.error("Could not export transactions");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 gap-2 print:hidden"
          disabled={busy}
        >
          <Download className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!report} onSelect={exportSummary}>
          <Table2 className="mr-2 size-4" />
          Summary (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportTransactions}>
          <FileText className="mr-2 size-4" />
          Transactions (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
