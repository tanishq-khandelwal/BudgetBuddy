import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type RequestType = InferRequestType<typeof client.api.recurring.$post>["json"];

export const useCreateRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (json: RequestType) => {
      const response = await client.api.recurring.$post({ json });
      if (!response.ok) throw new Error("Failed to create");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Recurring transaction created");
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
    onError: () => toast.error("Failed to create recurring transaction"),
  });
};
