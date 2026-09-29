"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { AmountInput } from "@/components/amount-input";

const formSchema = z.object({
  categoryId: z.string().min(1, "Choose a category"),
  amount: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Enter a limit greater than zero"),
});

export type BudgetFormValues = z.infer<typeof formSchema>;

type Props = {
  id?: string;
  defaultValues: BudgetFormValues;
  categoryOptions: { label: string; value: string }[];
  onCreateCategory: (name: string) => void;
  onSubmit: (values: BudgetFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const BudgetForm = ({
  id,
  defaultValues,
  categoryOptions,
  onCreateCategory,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CustomSelect
                  placeholder="Select or create a category"
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onCreate={onCreateCategory}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly limit</FormLabel>
              <FormControl>
                <AmountInput
                  allowNegative={false}
                  placeholder="0.00"
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="h-10 w-full" disabled={disabled}>
          {id ? "Save changes" : "Create budget"}
        </Button>
        {!!id && (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full text-destructive hover:text-destructive"
            disabled={disabled}
            onClick={onDelete}
          >
            <Trash className="size-4" />
            Delete budget
          </Button>
        )}
      </form>
    </Form>
  );
};
