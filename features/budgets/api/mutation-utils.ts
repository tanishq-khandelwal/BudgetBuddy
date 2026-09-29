import type { QueryClient } from "@tanstack/react-query";

export const invalidateBudgets = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
  queryClient.invalidateQueries({ queryKey: ["summary"] });
};

// Surfaces the API's friendly error message (e.g. the 409 duplicate).
export const readError = async (response: Response, fallback: string) => {
  if (response.ok) return;
  const body = await response.json().catch(() => null);
  throw new Error((body as { error?: string } | null)?.error ?? fallback);
};
