"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

const KEYS = [
  "transactions",
  "summary",
  "budgets",
  "reports",
  "recurring",
  "accounts",
];

// Once per page session, so re-renders and StrictMode don't repeat the call.
let processed = false;

// Materializes due recurring transactions when a signed-in user opens the app.
export const RecurringProcessor = () => {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await client.api.recurring.process.$post();
      if (!response.ok) throw new Error("Failed to process recurring");
      const { data } = await response.json();
      return data;
    },
    onSuccess: ({ created }) => {
      if (created <= 0) return;
      toast.success(
        `${created} recurring transaction${created === 1 ? "" : "s"} added`,
      );
      KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });

  useEffect(() => {
    if (isSignedIn !== true || processed) return;
    processed = true;
    mutate();
  }, [isSignedIn, mutate]);

  return null;
};
