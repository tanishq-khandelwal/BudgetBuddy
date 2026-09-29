"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { Wallet } from "lucide-react";
import { client } from "@/lib/hono";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import {
  DataTableColumnHeader,
  selectColumn,
} from "@/app/components/data-table";
import { Actions } from "./actions";

export type ResponseType = InferResponseType<
  typeof client.api.account.$get,
  200
>["data"][0];

export const Balance = ({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) => {
  const { formatMiliunits } = useCurrency();
  return (
    <span
      className={cn(
        "tabular-nums",
        amount < 0 && "text-destructive",
        className,
      )}
    >
      {formatMiliunits(amount)}
    </span>
  );
};

export const columns: ColumnDef<ResponseType>[] = [
  selectColumn<ResponseType>(),
  {
    accessorKey: "name",
    meta: { label: "Name" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/transactions?accountId=${row.original.id}`}
        className="inline-flex items-center gap-3 font-medium hover:underline"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="size-4" />
        </span>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "transactionCount",
    meta: { label: "Transactions", className: "text-right" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Transactions"
        className="ml-auto"
      />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.transactionCount}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    meta: { label: "Balance", className: "text-right" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Balance"
        className="ml-auto"
      />
    ),
    cell: ({ row }) => (
      <Balance amount={row.original.balance} className="font-medium" />
    ),
  },
  {
    id: "actions",
    meta: { className: "w-12 text-right" },
    cell: ({ row }) => (
      <Actions id={row.original.id} name={row.original.name} />
    ),
  },
];
