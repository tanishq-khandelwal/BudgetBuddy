import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useEditCategory = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { name: string }) => {
      if (!id) throw new Error("Category ID is required");

      const response = await client.api.categories[id].$patch({
        json: values,
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
};
