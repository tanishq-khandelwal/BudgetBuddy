import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";
import { insertCategoriesSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenCategory } from "../hooks/use-open-category";
import { useGetCategory } from "../api/use-get-category";
import { Loader2 } from "lucide-react";
import {  useDeleteCategory } from "../api/use-delete-category";
import { useConfirm } from "@/hooks/use-confirm";
import { useEditCategory } from "../api/use-edit-category";

const formSchema = insertCategoriesSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditCategorySheet = () => {
  const { isOpen, onClose, id } = useOpenCategory();
  const [ConfirmationDialog,Confirm]=useConfirm(
    "Are you Sure?",
    "You are about to delete this category",

  )

  const categoryQuery = useGetCategory(id);
  const editMutation=useEditCategory(id);
  const deleteMutation=useDeleteCategory(id);

  const isPending=editMutation.isPending || deleteMutation.isPending;

  const isLoading = categoryQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
    console.log({ values });
  };


  const onDelete=async()=>{
    const ok=await Confirm();

    if(ok){
      deleteMutation.mutate(undefined,{
        onSuccess: () => {
          onClose();
        },
      })
    }
  }
  const defaultValues = categoryQuery.data
    ? {
        name: categoryQuery.data.name,
      }
    : {
        name: "",
      };
  return (
    <>
    <ConfirmationDialog/>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Edit an Existing Category
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <CategoryForm
          id={id}
            onSubmit={onSubmit}
            disabled={isPending}
            defaultValue={defaultValues}
            onDelete={onDelete}
          />
        )}
      </SheetContent>
    </Sheet>
    </>
  );
};
