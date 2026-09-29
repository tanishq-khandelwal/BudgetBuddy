import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { client } from "@/lib/hono";

export const useGetSettings = () => {
  const { isSignedIn } = useAuth();
  return useQuery({
    enabled: !!isSignedIn,
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await client.api.settings.$get();
      if (!response.ok) throw new Error("Failed to fetch settings");
      const { data } = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
