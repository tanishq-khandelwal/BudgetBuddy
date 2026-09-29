import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetBudgets = (month?: string) =>
  useQuery({
    queryKey: ["budgets", { month }],
    queryFn: async () => {
      const response = await client.api.budgets.$get({ query: { month } });
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return await response.json();
    },
  });
