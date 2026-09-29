import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type RequestType = InferRequestType<
  (typeof client.api.recurring)[":id"]["$patch"]
>["json"];

export const useEditRecurring = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (json: RequestType) => {
      const response = await client.api.recurring[":id"].$patch({
        json,
        param: { id: id! },
      });
      if (!response.ok) throw new Error("Failed to update");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Recurring transaction updated");
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => toast.error("Failed to update recurring transaction"),
  });
};
