import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetRecurring = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ["recurring", { id }],
    queryFn: async () => {
      const response = await client.api.recurring[":id"].$get({
        param: { id: id! },
      });
      if (!response.ok) throw new Error("Failed to fetch recurring rule");
      const { data } = await response.json();
      return data;
    },
  });
