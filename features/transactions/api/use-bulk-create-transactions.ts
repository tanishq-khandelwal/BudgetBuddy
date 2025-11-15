import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log("Sending bulk create request:", json);
      const response = await client.api.transactions["bulk-create"]["$post"]({
        json,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bulk create error:", errorText);
        throw new Error(errorText || "Failed to create transactions");
      }

      const result = await response.json();
      console.log("Bulk create response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Bulk create success:", data);
      toast.success("Transactions created");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      console.error("Bulk create mutation error:", error);
      toast.error("Failed to create transactions");
    },
  });

  return mutation;
};
