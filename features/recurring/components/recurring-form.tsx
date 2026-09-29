"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/amount-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn, convertAmountToMiliunits } from "@/lib/utils";
import { nextOccurrences } from "@/lib/recurring";
import { RECURRING_FREQUENCIES } from "@/db/schema";

export const FREQUENCY_LABEL = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
} as const;

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Enter an amount greater than 0"),
  payee: z.string().trim().min(1, "Payee is required"),
  accountId: z.string().min(1, "Select an account"),
  categoryId: z.string().nullable().optional(),
  frequency: z.enum(RECURRING_FREQUENCIES),
  startDate: z.date(),
  endDate: z.date().nullable(),
  notes: z.string().nullable().optional(),
});

export type RecurringFormValues = z.infer<typeof formSchema>;

export type RecurringSubmit = {
  accountId: string;
  categoryId: string | null;
  payee: string;
  amount: number;
  notes: string | null;
  frequency: RecurringFormValues["frequency"];
  startDate: Date;
  endDate: Date | null;
};

type Option = { label: string; value: string };

type Props = {
  id?: string;
  defaultValue?: RecurringFormValues;
  onSubmit: (values: RecurringSubmit) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: Option[];
  categoryOptions: Option[];
  onCreateAccount: (name: string) => void;
  onCreateCategory: (name: string) => void;
};

function Segmented<T extends string>({
  value,
  onChange,
  options,
  disabled,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            value === o.value && "bg-background text-foreground shadow-sm",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const emptyDefaults = (): RecurringFormValues => ({
  type: "expense",
  amount: "",
  payee: "",
  accountId: "",
  categoryId: null,
  frequency: "monthly",
  startDate: new Date(),
  endDate: null,
  notes: "",
});

export const RecurringForm = ({
  id,
  defaultValue,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue ?? emptyDefaults(),
  });

  const [frequency, startDate, endDate] = useWatch({
    control: form.control,
    name: ["frequency", "startDate", "endDate"],
  });
  const preview = nextOccurrences(
    { frequency, startDate, nextDate: startDate, endDate },
    3,
  );

  const handleSubmit = (v: RecurringFormValues) => {
    const magnitude = convertAmountToMiliunits(parseFloat(v.amount));
    onSubmit({
      accountId: v.accountId,
      categoryId: v.categoryId || null,
      payee: v.payee,
      amount: v.type === "expense" ? -magnitude : magnitude,
      notes: v.notes || null,
      frequency: v.frequency,
      startDate: v.startDate,
      endDate: v.endDate,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 pt-4"
      >
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Segmented
                label="Type"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                options={[
                  { value: "expense", label: "Expense" },
                  { value: "income", label: "Income" },
                ]}
              />
            </FormItem>
          )}
        />

        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  allowNegative={false}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="0.00"
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
                  {...field}
                  placeholder="Rent, Netflix, Salary…"
                  disabled={disabled}
                  className="h-11"
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
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
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
              <FormLabel>Category (optional)</FormLabel>
              <FormControl>
                <CustomSelect
                  placeholder="Select a category"
                  options={categoryOptions}
                  onCreate={onCreateCategory}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="frequency"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeats</FormLabel>
              <Segmented
                label="Frequency"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                options={RECURRING_FREQUENCIES.map((f) => ({
                  value: f,
                  label: FREQUENCY_LABEL[f],
                }))}
              />
            </FormItem>
          )}
        />

        <FormField
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={(d) => d && field.onChange(d)}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="endDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>End date</FormLabel>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Never
                  <Switch
                    checked={field.value === null}
                    disabled={disabled}
                    onCheckedChange={(never) =>
                      field.onChange(never ? null : new Date())
                    }
                  />
                </label>
              </div>
              {field.value && (
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={(d) => d && field.onChange(d)}
                    disabled={disabled}
                  />
                </FormControl>
              )}
            </FormItem>
          )}
        />

        <p
          aria-live="polite"
          className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          {preview.length
            ? `Next: ${preview.map((d) => format(d, "MMM d")).join(", ")}`
            : "No upcoming occurrences"}
        </p>

        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Optional notes"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2 pt-1">
          <Button type="submit" className="h-11 w-full" disabled={disabled}>
            {id ? "Save changes" : "Create recurring"}
          </Button>
          {!!id && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={onDelete}
              className="h-11 w-full text-destructive hover:text-destructive"
            >
              <Trash className="mr-2 size-4" />
              Delete recurring
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
