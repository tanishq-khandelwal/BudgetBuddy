"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import {
  DataTableColumnHeader,
  selectColumn,
} from "@/app/components/data-table";
import { CategoryAvatar } from "@/features/categories/components/category-chip";
import { Actions } from "./actions";

export type ResponseType = InferResponseType<
  typeof client.api.categories.$get,
  200
>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  selectColumn<ResponseType>(),
  {
    accessorKey: "name",
    meta: { label: "Name" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-3 font-medium">
        <CategoryAvatar name={row.original.name} className="size-8" />
        {row.original.name}
      </span>
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
    id: "actions",
    meta: { className: "w-12 text-right" },
    cell: ({ row }) => (
      <Actions id={row.original.id} name={row.original.name} />
    ),
  },
];
