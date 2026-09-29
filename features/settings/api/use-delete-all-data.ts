import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useDeleteAllData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await client.api.settings.data.$delete();
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      toast.success("All your data has been deleted");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't delete your data"),
  });
};
