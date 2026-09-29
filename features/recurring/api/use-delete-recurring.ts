import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useDeleteRecurring = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ruleId?: string) => {
      const response = await client.api.recurring[":id"].$delete({
        param: { id: (ruleId ?? id)! },
      });
      if (!response.ok) throw new Error("Failed to delete");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Recurring transaction deleted");
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Failed to delete recurring transaction"),
  });
};
