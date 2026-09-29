import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { invalidateBudgets, readError } from "./mutation-utils";

type RequestType = InferRequestType<typeof client.api.budgets.$post>["json"];

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets.$post({ json });
      await readError(response, "Failed to create budget");
    },
    onSuccess: () => {
      toast.success("Budget created");
      invalidateBudgets(queryClient);
    },
    onError: (e) => toast.error(e.message),
  });
};
