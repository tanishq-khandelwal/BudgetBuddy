"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/app/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useBulkDeletecategories } from "@/features/categories/api/use-bulk-delete";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

const CategoriesPage = () => {
  const newCategory = useNewCategory();
  const deleteCategories = useBulkDeletecategories();
  const categoryQuery = useGetCategories();
  console.log(categoryQuery);
  const categories = categoryQuery.data || [];

    console.log(categoryQuery);
  const isDisabled = categoryQuery.isLoading || deleteCategories.isPending;

  if (categoryQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="bordere-none drop-shadow-sm bg-white">
          <CardHeader>
            <Skeleton className="h-8 w-48"/>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin"/>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="bordere-none drop-shadow-sm bg-white">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Categories Page</CardTitle>
          <Button
            onClick={newCategory.onOpen}
            size="sm"
            className="bg-black text-white hover:bg-black rounded-md"
          >
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="name"
            columns={columns}
            data={categories}
            onDelete={(row) => {
              const ids = row.map((r) => r.id);
              deleteCategories.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;