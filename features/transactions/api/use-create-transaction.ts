import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  typeof client.api.transactions.$post,
  200
>;
type RequestType = InferRequestType<
  typeof client.api.transactions.$post
>["json"];

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions.$post({ json });
      if (!response.ok) throw new Error("Failed to create transaction");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction added");
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
