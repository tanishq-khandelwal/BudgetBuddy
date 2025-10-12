import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/hono";

export const useGetTransactions = () => {
  const params = useSearchParams();

  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const isParamsReady = Boolean(accountId || from || to);

  const query = useQuery({
    queryKey: ["transactions", { from, to, accountId }],

    enabled: isParamsReady,

    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: { from, to, accountId: accountId },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch transactions");
      }

      const { data } = await response.json();
      return data;
    },

    staleTime: 1000 * 60,
    retry: 1,
  });

  return query;
};
