import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { invalidateBudgets, readError } from "./mutation-utils";

type RequestType = InferRequestType<
  (typeof client.api.budgets)[":id"]["$patch"]
>["json"];

export const useEditBudget = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error("Budget ID is required");
      const response = await client.api.budgets[":id"].$patch({
        param: { id },
        json,
      });
      await readError(response, "Failed to update budget");
    },
    onSuccess: () => {
      toast.success("Budget updated");
      invalidateBudgets(queryClient);
    },
    onError: (e) => toast.error(e.message),
  });
};
