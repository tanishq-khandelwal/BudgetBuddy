import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions["bulk-create"]["$post"]({
        json,
      });
      if (!response.ok) throw new Error("Failed to import transactions");
      return await response.json();
    },
    onSuccess: (data) => {
      const n = data.data.length;
      toast.success(
        n === 1 ? "1 transaction imported" : `${n} transactions imported`,
      );
      for (const key of [
        "transactions",
        "summary",
        "budgets",
        "reports",
        "accounts",
      ]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: () => {
      toast.error("Couldn't import transactions");
    },
  });
};
