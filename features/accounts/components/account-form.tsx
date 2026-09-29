import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a name")
    .max(60, "Keep it under 60 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: string;
  defaultValue?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  /** Disables everything (any request in flight). */
  disabled?: boolean;
  /** Shows the spinner on the save button. */
  saving?: boolean;
};

export const AccountForm = ({
  id,
  defaultValue,
  onSubmit,
  onDelete,
  disabled,
  saving,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue ?? { name: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  autoComplete="off"
                  disabled={disabled}
                  placeholder="e.g. Checking, Savings, Credit Card"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" disabled={disabled}>
            {saving && <Loader2 className="animate-spin" />}
            {id ? "Save changes" : "Create account"}
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
              Delete account
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
