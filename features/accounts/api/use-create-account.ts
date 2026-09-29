import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.account.$post, 200>;
type RequestType = InferRequestType<typeof client.api.account.$post>["json"];

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.account.$post({ json });
      if (!response.ok) throw new Error("Failed to create account");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account added");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => {
      toast.error("Couldn't save account");
    },
  });
};
