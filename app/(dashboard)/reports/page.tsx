import { Suspense } from "react";
import { ReportsView } from "@/features/reports/components/reports-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsView />
    </Suspense>
  );
}
