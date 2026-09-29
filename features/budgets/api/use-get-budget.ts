import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetBudget = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ["budgets", "detail", { id }],
    queryFn: async () => {
      const response = await client.api.budgets[":id"].$get({
        param: { id: id! },
      });
      if (!response.ok) throw new Error("Failed to fetch budget");
      const { data } = await response.json();
      return data;
    },
  });
