"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeftRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AccountFilter } from "@/components/account-filter";
import { DateFilter } from "@/components/date-filter";
import { DataTable } from "@/app/components/data-table";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transaction";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { CategoryCell, Amount, RecurringBadge, columns } from "./columns";
import { Actions } from "./actions";
import { ImportCard } from "./import-card";
import { UploadButton } from "./upload-button";
import { useSelectAccount } from "./use-select-account";

const Summary = ({
  income,
  expenses,
}: {
  income: number;
  expenses: number;
}) => {
  const { formatMiliunits } = useCurrency();
  const net = income - expenses;
  const items = [
    {
      label: "Income",
      value: `+${formatMiliunits(income)}`,
      tone: "text-success",
    },
    { label: "Expenses", value: formatMiliunits(expenses), tone: "" },
    {
      label: "Net",
      value: `${net > 0 ? "+" : ""}${formatMiliunits(net)}`,
      tone: net > 0 ? "text-success" : net < 0 ? "text-destructive" : "",
    },
  ];
  return (
    <dl className="mb-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-2 bg-card px-4 py-3 sm:block"
        >
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-lg font-semibold tabular-nums tracking-tight sm:mt-1 sm:text-xl",
              item.tone,
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const TransactionsPage = () => {
  const [importing, setImporting] = useState(false);
  const [csv, setCsv] = useState<string[][]>([]);

  const newTransaction = useNewTransaction();
  const { onOpen: openTransaction } = useOpenTransaction();
  const createTransactions = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data ?? [];
  const [AccountDialog, pickAccount] = useSelectAccount();

  const onUpload = (results: { data: string[][] }) => {
    if (results.data.length < 2) {
      toast.error("That file has no rows to import", {
        description: "It needs a header row and at least one transaction.",
      });
      return;
    }
    setCsv(results.data);
    setImporting(true);
  };

  const onCancelImport = () => {
    setCsv([]);
    setImporting(false);
  };

  const onSubmitImport = async (
    rows: {
      date: Date;
      payee: string;
      amount: number;
      notes: string | null;
    }[],
  ) => {
    const accountId = await pickAccount(rows.length);
    if (!accountId) return;

    createTransactions.mutate(
      rows.map((row) => ({ ...row, accountId, categoryId: null })),
      { onSuccess: onCancelImport },
    );
  };

  if (importing) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          key={csv.length ? "data" : "empty"}
          data={csv}
          onUpload={onUpload}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
          submitting={createTransactions.isPending}
        />
      </>
    );
  }

  const income = transactions.reduce(
    (s, t) => s + (t.amount > 0 ? t.amount : 0),
    0,
  );
  const expenses = transactions.reduce(
    (s, t) => s + (t.amount < 0 ? -t.amount : 0),
    0,
  );

  return (
    <>
      <AccountDialog />
      <PageHeader
        title="Transactions"
        description="Everything coming in and going out."
        actions={
          <>
            <UploadButton onUpload={onUpload} />
            <Button onClick={newTransaction.onOpen}>
              <Plus /> Add transaction
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <AccountFilter />
        <DateFilter />
      </div>

      {transactionsQuery.isLoading ? (
        <div aria-busy className="space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : transactionsQuery.isError ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Couldn't load transactions"
          description="Check your connection and try again."
          action={
            <Button
              variant="outline"
              onClick={() => transactionsQuery.refetch()}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <Summary income={income} expenses={expenses} />
          <DataTable
            filterKey="payee"
            searchPlaceholder="Search payees…"
            columns={columns}
            data={transactions}
            pageSize={25}
            onDelete={(rows) =>
              deleteTransactions.mutate({ ids: rows.map((r) => r.id) })
            }
            disabled={
              deleteTransactions.isPending || createTransactions.isPending
            }
            emptyState={
              <EmptyState
                icon={ArrowLeftRight}
                title="No transactions in this range"
                description="Add a transaction, import a CSV, or widen the date range or account filter."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <UploadButton onUpload={onUpload} />
                    <Button onClick={newTransaction.onOpen}>
                      <Plus /> Add transaction
                    </Button>
                  </div>
                }
              />
            }
            renderMobileRow={(t) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openTransaction(t.id)}
                    className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="truncate font-medium">{t.payee}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "EEE, d MMM yyyy")} ·{" "}
                      {t.account}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Amount amount={t.amount} />
                    <div className="-mr-2 -my-2">
                      <Actions id={t.id} payee={t.payee} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryCell row={t} />
                  {t.recurringId && <RecurringBadge />}
                </div>
                {t.notes && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {t.notes}
                  </p>
                )}
              </div>
            )}
          />
        </>
      )}
    </>
  );
};

export default TransactionsPage;
