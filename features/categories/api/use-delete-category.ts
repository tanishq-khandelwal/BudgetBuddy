import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>;


export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.categories[":id"]["$delete"]({
        param: { id },
      });
      console.log(response);
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Caetgory Deleted");
      queryClient.invalidateQueries({ queryKey: ["categories",{id}] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  return mutation;
};
