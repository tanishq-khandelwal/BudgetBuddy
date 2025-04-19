import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";


import { insertAccountSchema, insertCategoriesSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateCategory } from "../api/use-create-category";
import { CategoryForm } from "./category-form";
import { useNewCategory } from "../hooks/use-new-category";


const formSchema = insertCategoriesSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;
export const NewCategorySheet = () => {
  const { isOpen, onClose } = useNewCategory();

  const mutation = useCreateCategory();

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values,{
      onSuccess:()=>{
        onClose();
      }
    });
    console.log({ values });
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Category</SheetTitle>
          <SheetDescription>
            Create a new category to track your transactions.
          </SheetDescription>
        </SheetHeader>

        <CategoryForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValue={{
            name: "",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
