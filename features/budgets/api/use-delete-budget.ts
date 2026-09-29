import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { invalidateBudgets, readError } from "./mutation-utils";

export const useDeleteBudget = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error>({
    mutationFn: async () => {
      if (!id) throw new Error("Budget ID is required");
      const response = await client.api.budgets[":id"].$delete({
        param: { id },
      });
      await readError(response, "Failed to delete budget");
    },
    onSuccess: () => {
      toast.success("Budget deleted");
      invalidateBudgets(queryClient);
    },
    onError: (e) => toast.error(e.message),
  });
};
