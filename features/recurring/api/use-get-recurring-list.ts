import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetRecurringList = () =>
  useQuery({
    queryKey: ["recurring", "list"],
    queryFn: async () => {
      const response = await client.api.recurring.$get();
      if (!response.ok) throw new Error("Failed to fetch recurring rules");
      const { data } = await response.json();
      return data;
    },
  });
