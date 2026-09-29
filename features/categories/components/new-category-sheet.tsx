"use client";

import { FormSheet } from "@/app/components/form-sheet";
import { useNewCategory } from "../hooks/use-new-category";
import { CategoryForm } from "./category-form";
import { useCreateCategory } from "../api/use-create-category";

export const NewCategorySheet = () => {
  const { isOpen, onClose } = useNewCategory();
  const mutation = useCreateCategory();

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={onClose}
      title="New category"
      description="Categories group your transactions and power budgets and reports."
    >
      <CategoryForm
        onSubmit={(values) => mutation.mutate(values, { onSuccess: onClose })}
        disabled={mutation.isPending}
        saving={mutation.isPending}
      />
    </FormSheet>
  );
};
