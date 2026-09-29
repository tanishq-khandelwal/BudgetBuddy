import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { insertTransactionsSchema } from "@/db/schema";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { AmountInput } from "@/components/amount-input";
import { convertAmountToMiliunits } from "@/lib/utils";

const formSchema = z.object({
  date: z.coerce.date({ message: "Pick a date" }),
  accountId: z.string().min(1, "Select an account"),
  categoryId: z.string().nullable().optional(),
  payee: z.string().trim().min(1, "Enter a payee"),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => Number.isFinite(parseFloat(v)) && parseFloat(v) !== 0, {
      message: "Amount can't be zero",
    }),
  notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionsSchema.omit({
  id: true,
});

export type TransactionFormValues = z.infer<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValue?: Partial<TransactionFormValues>;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  /** Disables everything (any request in flight). */
  disabled?: boolean;
  /** Shows the spinner on the save button. */
  saving?: boolean;
  accountOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  /** Resolve to the new id to have it selected automatically. */
  onCreateAccount: (name: string) => Promise<string | undefined> | void;
  onCreateCategory: (name: string) => Promise<string | undefined> | void;
};

export const TransactionForm = ({
  id,
  defaultValue,
  onSubmit,
  onDelete,
  disabled,
  saving,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      accountId: accountOptions.length === 1 ? accountOptions[0].value : "",
      categoryId: null,
      payee: "",
      amount: "",
      notes: "",
      ...defaultValue,
    },
  });

  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit({
      ...values,
      categoryId: values.categoryId || null,
      notes: values.notes?.trim() || null,
      amount: convertAmountToMiliunits(parseFloat(values.amount)),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  autoComplete="off"
                  placeholder="Who was it with?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <CustomSelect
                  placeholder="Select or create an account"
                  options={accountOptions}
                  onCreate={async (name) => {
                    const newId = await onCreateAccount(name);
                    if (newId) field.onChange(newId);
                  }}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <CustomSelect
                  placeholder="Select or create a category"
                  options={categoryOptions}
                  onCreate={async (name) => {
                    const newId = await onCreateCategory(name);
                    if (newId) field.onChange(newId);
                  }}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? null)}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  rows={3}
                  placeholder="Anything worth remembering"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" disabled={disabled}>
            {saving && <Loader2 className="animate-spin" />}
            {id ? "Save changes" : "Add transaction"}
          </Button>
          {!!id && (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 />
              Delete transaction
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
