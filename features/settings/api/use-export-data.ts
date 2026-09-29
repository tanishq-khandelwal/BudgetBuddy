import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useExportData = () =>
  useMutation({
    mutationFn: async () => {
      const response = await client.api.settings.export.$get();
      if (!response.ok) throw new Error("Export failed");
      const blob = new Blob([JSON.stringify(await response.json(), null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bb-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success("Export downloaded"),
    onError: () => toast.error("Couldn't export your data"),
  });
