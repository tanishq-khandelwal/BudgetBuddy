"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { Trash } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete?: (rows: TData[]) => void;
  filterKey?: string  ;
  disabled?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  filterKey,
  disabled,
}: DataTableProps<TData, TValue>) {

  const [ConfirmDialog,confirm]=useConfirm(
    "Are you sure?",
    "You are about to delete the selected rows. This action cannot be undone."
  )
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  return (
    <div>
      <ConfirmDialog/>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter ${filterKey}`}
          value={(table.getColumn(filterKey ?? "")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterKey ?? "")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {selectedRows.length > 0 && (
          <Button
            disabled={disabled}
            size="sm"
            variant="outline"
            className="ml-auto font-normal text-xs"
            onClick={async() => {

              const ok=await confirm()

              if(ok){
                if (onDelete) {
                  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
                  onDelete(selectedRows); // Ensure you pass `TData[]` instead of `Row<TData>[]`
                }
                table.resetRowSelection()
              }
            
            }}
          >
            <Trash className="size-4 mr-2" />
            Delete ({selectedRows.length})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => row.toggleSelected()}
                  className={row.getIsSelected() ? "bg-gray-100" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex-1 flex items-end justify-end gap-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
