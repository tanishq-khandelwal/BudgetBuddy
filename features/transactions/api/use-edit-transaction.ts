import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$patch"]
>["json"];

export const useEditTransactions = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions[":id"]["$patch"]({
        json,
        param: { id },
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Couldn't save transaction");
    },
  });
};
