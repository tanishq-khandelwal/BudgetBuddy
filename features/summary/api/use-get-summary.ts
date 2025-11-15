import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/hono";

export const useGetSummary = () => {
  const params = useSearchParams();

  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["summary", { from, to, accountId }],

    queryFn: async () => {
      const response = await client.api.summary.$get({
        query: {
          from: from || undefined,
          to: to || undefined,
          accountId: accountId || undefined,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch summary");
      }

      const { data } = await response.json();
      return data;
    },

    staleTime: 1000 * 60,
    retry: 1,
  });

  return query;
};
