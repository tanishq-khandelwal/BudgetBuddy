import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.account["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.account["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteAccounts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.account["bulk-delete"]["$post"]({ json });
        console.log(response);
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Accounts Deleted");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Failed to Delete account");
    },
  });

  return mutation;
};
