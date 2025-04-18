import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.account)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.account)[":id"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.account[":id"]["$patch"]({
        json,
        param: { id }
      });
      console.log(response);
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account upadted");
      queryClient.invalidateQueries({ queryKey: ["account",{id}] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: () => {
      toast.error("Failed to update account");
    },
  });

  return mutation;
};
