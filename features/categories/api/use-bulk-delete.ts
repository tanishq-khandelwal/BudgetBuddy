import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.categories)["bulk-delete"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.categories)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeletecategories = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.categories["bulk-delete"]["$post"]({
        json,
      });
      if (!response.ok) throw new Error("Failed to delete categorys");
      return await response.json();
    },
    onSuccess: (data) => {
      const n = data.data.length;
      toast.success(n === 1 ? "1 category deleted" : `${n} categorys deleted`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => {
      toast.error("Couldn't delete categorys");
    },
  });
};
