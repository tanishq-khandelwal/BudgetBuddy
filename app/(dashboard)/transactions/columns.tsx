"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { format } from "date-fns";
import { Repeat } from "lucide-react";
import { client } from "@/lib/hono";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import {
  DataTableColumnHeader,
  selectColumn,
} from "@/app/components/data-table";
import { CategoryChip } from "@/features/categories/components/category-chip";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { Actions } from "./actions";

export type ResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export const Amount = ({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) => {
  const { formatMiliunits } = useCurrency();
  const income = amount > 0;
  return (
    <span
      className={cn(
        "whitespace-nowrap font-medium tabular-nums",
        income && "text-success",
        className,
      )}
    >
      {income && "+"}
      {formatMiliunits(amount)}
    </span>
  );
};

export const RecurringBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
    <Repeat className="size-3" />
    Recurring
  </span>
);

/** Category pill; uncategorized rows show a muted button that opens the edit sheet. */
export const CategoryCell = ({ row }: { row: ResponseType }) => {
  const { onOpen } = useOpenTransaction();
  if (row.category) return <CategoryChip name={row.category} />;
  return (
    <button
      type="button"
      onClick={() => onOpen(row.id)}
      className="inline-flex items-center rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Uncategorized
    </button>
  );
};

export const columns: ColumnDef<ResponseType>[] = [
  selectColumn<ResponseType>(),
  {
    accessorKey: "date",
    meta: { label: "Date" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {format(new Date(row.original.date), "d MMM yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "payee",
    meta: { label: "Payee" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payee" />
    ),
    cell: ({ row }) => (
      <div className="min-w-0 max-w-xs">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{row.original.payee}</span>
          {row.original.recurringId && <RecurringBadge />}
        </div>
        {row.original.notes && (
          <p className="truncate text-xs text-muted-foreground">
            {row.original.notes}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    meta: { label: "Category" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => <CategoryCell row={row.original} />,
  },
  {
    accessorKey: "account",
    meta: { label: "Account" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.account}</span>
    ),
  },
  {
    accessorKey: "amount",
    meta: { label: "Amount", className: "text-right" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="ml-auto"
      />
    ),
    cell: ({ row }) => <Amount amount={row.original.amount} />,
  },
  {
    id: "actions",
    meta: { className: "w-12 pl-0 text-right" },
    cell: ({ row }) => (
      <Actions id={row.original.id} payee={row.original.payee} />
    ),
  },
];
