import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.account)["bulk-delete"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.account)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.account["bulk-delete"]["$post"]({
        json,
      });
      if (!response.ok) throw new Error("Failed to delete accounts");
      return await response.json();
    },
    onSuccess: (data) => {
      const n = data.data.length;
      toast.success(n === 1 ? "1 account deleted" : `${n} accounts deleted`);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => {
      toast.error("Couldn't delete accounts");
    },
  });
};
