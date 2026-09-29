"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { DataTable } from "@/app/components/data-table";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete";
import { useCurrency } from "@/hooks/use-currency";
import { Actions } from "./actions";
import { Balance, columns } from "./columns";

type View = "grid" | "table";

const AccountsPage = () => {
  const [view, setView] = useState<View>("grid");
  const newAccount = useNewAccount();
  const deleteAccounts = useBulkDeleteAccounts();
  const accountQuery = useGetAccounts();
  const { formatMiliunits } = useCurrency();
  const accounts = accountQuery.data ?? [];
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  const addButton = (
    <Button onClick={newAccount.onOpen}>
      <Plus /> Add account
    </Button>
  );

  const header = (
    <PageHeader
      title="Accounts"
      description={
        accounts.length
          ? `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"} · Total balance ${formatMiliunits(total)}`
          : "Where your money lives."
      }
      actions={
        <>
          {accounts.length > 0 && (
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as View)}
              variant="outline"
              aria-label="View"
              className="hidden sm:flex"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <List className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          {addButton}
        </>
      }
    />
  );

  if (accountQuery.isLoading) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  if (accountQuery.isError) {
    return (
      <>
        {header}
        <EmptyState
          icon={Wallet}
          title="Couldn't load accounts"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => accountQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </>
    );
  }

  if (!accounts.length) {
    return (
      <>
        {header}
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first account, like a checking account or a credit card, to start tracking transactions."
          action={addButton}
        />
      </>
    );
  }

  return (
    <>
      {header}
      {view === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="group relative flex flex-col justify-between gap-6 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wallet className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-medium">{account.name}</h2>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {account.transactionCount}{" "}
                      {account.transactionCount === 1
                        ? "transaction"
                        : "transactions"}
                    </p>
                  </div>
                </div>
                <div className="-mr-2 -mt-2">
                  <Actions id={account.id} name={account.name} />
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Balance
                  </p>
                  <Balance
                    amount={account.balance}
                    className="text-2xl font-semibold tracking-tight"
                  />
                </div>
                <Link
                  href={`/transactions?accountId=${account.id}`}
                  className="inline-flex h-10 items-center rounded-md px-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View activity →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <DataTable
          filterKey="name"
          searchPlaceholder="Search accounts…"
          columns={columns}
          data={accounts}
          onDelete={(rows) =>
            deleteAccounts.mutate({ ids: rows.map((r) => r.id) })
          }
          disabled={deleteAccounts.isPending}
        />
      )}
    </>
  );
};

export default AccountsPage;
