"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Label used for the column in the default mobile card. */
    label?: string;
    /** Extra classes for the header and cells of this column (e.g. text-right). */
    className?: string;
  }
}

/** Drop-in sortable header for column definitions. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "-mx-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 uppercase tracking-wide transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        sorted && "text-foreground",
        className,
      )}
    >
      {title}
      <Icon className="size-3.5" />
    </button>
  );
}

export type MobileRowHelpers = {
  selected: boolean;
  toggleSelected: () => void;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete?: (rows: TData[]) => void;
  filterKey?: string;
  disabled?: boolean;
  /** Custom card for one row below the md breakpoint. Selection checkbox is added around it. */
  renderMobileRow?: (row: TData, helpers: MobileRowHelpers) => React.ReactNode;
  /** Shown instead of the table when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Extra controls placed next to the search input. */
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  pageSize?: number;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  filterKey,
  disabled,
  renderMobileRow,
  emptyState,
  toolbar,
  searchPlaceholder,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => {
      const id = (row as { id?: unknown }).id;
      return typeof id === "string" ? id : String(index);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnFilters, rowSelection },
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const count = selectedRows.length;

  const [ConfirmDialog, confirm] = useConfirm(
    count === 1 ? "Delete 1 item?" : `Delete ${count} items?`,
    "This can't be undone.",
    { confirmLabel: "Delete" },
  );

  const handleDelete = async () => {
    if (!(await confirm())) return;
    onDelete?.(selectedRows);
    table.resetRowSelection();
  };

  const searchColumn = filterKey ? table.getColumn(filterKey) : undefined;
  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize: size } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : pageIndex * size + 1;
  const to = Math.min(total, (pageIndex + 1) * size);
  const selectable = !!onDelete;

  if (data.length === 0 && emptyState) return <>{emptyState}</>;

  const visibleColumns = table
    .getVisibleLeafColumns()
    .filter((c) => c.id !== "select" && c.id !== "actions");

  return (
    <div className="space-y-3">
      <ConfirmDialog />

      {/* Toolbar / bulk bar */}
      {count > 0 ? (
        <div
          role="status"
          className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 animate-in fade-in-0 slide-in-from-top-1"
        >
          <span className="text-sm font-medium">{count} selected</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => table.resetRowSelection()}
          >
            <X /> Clear
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            disabled={disabled}
            onClick={handleDelete}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      ) : (
        (searchColumn || toolbar) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {searchColumn && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label={`Search by ${filterKey}`}
                  placeholder={searchPlaceholder ?? `Search ${filterKey}…`}
                  value={(searchColumn.getFilterValue() as string) ?? ""}
                  onChange={(e) => searchColumn.setFilterValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            {toolbar && <div className="sm:ml-auto">{toolbar}</div>}
          </div>
        )
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_hsl(var(--border))]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground",
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="border-t transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 align-middle",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {rows.length ? (
          rows.map((row) => {
            const helpers = {
              selected: row.getIsSelected(),
              toggleSelected: () => row.toggleSelected(),
            };
            const actionsCell = row
              .getVisibleCells()
              .find((c) => c.column.id === "actions");
            return (
              <li
                key={row.id}
                data-state={helpers.selected ? "selected" : undefined}
                className="flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors data-[state=selected]:border-primary/40 data-[state=selected]:bg-primary/5"
              >
                {selectable && (
                  <label className="-m-2 flex size-10 shrink-0 items-center justify-center">
                    <Checkbox
                      checked={helpers.selected}
                      onCheckedChange={(v) => row.toggleSelected(!!v)}
                      aria-label="Select row"
                    />
                  </label>
                )}
                <div className="min-w-0 flex-1">
                  {renderMobileRow ? (
                    renderMobileRow(row.original, helpers)
                  ) : (
                    <dl className="space-y-1.5 text-sm">
                      {visibleColumns.map((col, i) => {
                        const cell = row
                          .getVisibleCells()
                          .find((c) => c.column.id === col.id);
                        if (!cell) return null;
                        const header = col.columnDef.header;
                        const label =
                          col.columnDef.meta?.label ??
                          (typeof header === "string" ? header : col.id);
                        const content = flexRender(
                          col.columnDef.cell,
                          cell.getContext(),
                        );
                        return i === 0 ? (
                          <div key={col.id} className="font-medium">
                            {content}
                          </div>
                        ) : (
                          <div
                            key={col.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <dt className="text-muted-foreground capitalize">
                              {label}
                            </dt>
                            <dd className="min-w-0 text-right">{content}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </div>
                {actionsCell && !renderMobileRow && (
                  <div className="-mr-1 -mt-1 shrink-0">
                    {flexRender(
                      actionsCell.column.columnDef.cell,
                      actionsCell.getContext(),
                    )}
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No results found.
          </li>
        )}
      </ul>

      {/* Footer */}
      {total > 0 && (
        <div className="flex flex-col gap-3 pt-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <span className="tabular-nums">
              {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows</span>
              <Select
                value={String(size)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger
                  className="h-9 w-[76px]"
                  aria-label="Rows per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set([...PAGE_SIZES, pageSize])]
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="tabular-nums">
              Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Standard select-column definitions for use in column arrays. */
export function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <label className="-m-3 flex size-10 items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all rows on this page"
        />
      </label>
    ),
    cell: ({ row }) => (
      <label className="-m-3 flex size-10 items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </label>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: "w-12 pr-0" },
  };
}
