import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useToggleRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.recurring[":id"].toggle.$post({
        param: { id },
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success(data.isActive ? "Recurring resumed" : "Recurring paused");
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => toast.error("Failed to update recurring transaction"),
  });
};
