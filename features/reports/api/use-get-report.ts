import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/hono";
import { resolveRange } from "@/features/reports/lib/range";

export const useGetReport = () => {
  const params = useSearchParams();
  const { from, to } = resolveRange(params.get("from"), params.get("to"));
  const accountId = params.get("accountId") || "";

  return useQuery({
    queryKey: ["reports", { from, to, accountId }],

    queryFn: async () => {
      const response = await client.api.reports.$get({
        query: { from, to, accountId: accountId || undefined },
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to fetch report");
      }

      const { data } = await response.json();
      return data;
    },

    staleTime: 1000 * 60,
    retry: 1,
  });
};

export type Report = NonNullable<ReturnType<typeof useGetReport>["data"]>;
