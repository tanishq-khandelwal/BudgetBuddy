import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { invalidateBudgets, readError } from "./mutation-utils";

type RequestType = InferRequestType<
  (typeof client.api.budgets)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteBudgets = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets["bulk-delete"].$post({ json });
      await readError(response, "Failed to delete budgets");
    },
    onSuccess: () => {
      toast.success("Budgets deleted");
      invalidateBudgets(queryClient);
    },
    onError: (e) => toast.error(e.message),
  });
};
