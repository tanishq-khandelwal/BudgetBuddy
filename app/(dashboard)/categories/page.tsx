"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { DataTable } from "@/app/components/data-table";
import { CategoryAvatar } from "@/features/categories/components/category-chip";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useBulkDeletecategories } from "@/features/categories/api/use-bulk-delete";
import { Actions } from "./actions";
import { columns } from "./columns";

type View = "grid" | "table";

const CategoriesPage = () => {
  const [view, setView] = useState<View>("grid");
  const newCategory = useNewCategory();
  const deleteCategories = useBulkDeletecategories();
  const categoryQuery = useGetCategories();
  const categories = categoryQuery.data ?? [];

  const addButton = (
    <Button onClick={newCategory.onOpen}>
      <Plus /> Add category
    </Button>
  );

  const header = (
    <PageHeader
      title="Categories"
      description="Group transactions to see where your money goes."
      actions={
        <>
          {categories.length > 0 && (
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

  if (categoryQuery.isLoading) {
    return (
      <>
        {header}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  if (categoryQuery.isError) {
    return (
      <>
        {header}
        <EmptyState
          icon={Tags}
          title="Couldn't load categories"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => categoryQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </>
    );
  }

  if (!categories.length) {
    return (
      <>
        {header}
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories like Groceries, Rent or Salary to organise your spending and set budgets."
          action={addButton}
        />
      </>
    );
  }

  return (
    <>
      {header}
      {view === "grid" ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-3">
                <CategoryAvatar name={category.name} />
                <div className="min-w-0">
                  <h2 className="truncate font-medium">{category.name}</h2>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {category.transactionCount}{" "}
                    {category.transactionCount === 1
                      ? "transaction"
                      : "transactions"}
                  </p>
                </div>
              </div>
              <Actions id={category.id} name={category.name} />
            </li>
          ))}
        </ul>
      ) : (
        <DataTable
          filterKey="name"
          searchPlaceholder="Search categories…"
          columns={columns}
          data={categories}
          onDelete={(rows) =>
            deleteCategories.mutate({ ids: rows.map((r) => r.id) })
          }
          disabled={deleteCategories.isPending}
        />
      )}
    </>
  );
};

export default CategoriesPage;
