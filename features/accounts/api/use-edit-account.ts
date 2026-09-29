import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.account)[":id"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.account)[":id"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.account[":id"]["$patch"]({
        json,
        param: { id },
      });
      if (!response.ok) throw new Error("Failed to update account");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account updated");
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
