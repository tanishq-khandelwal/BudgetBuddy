import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"],
  200
>;

export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.categories[":id"]["$delete"]({
        param: { id },
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => {
      toast.error("Couldn't delete category");
    },
  });
};
