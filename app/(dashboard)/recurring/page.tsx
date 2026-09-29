import { RecurringView } from "@/features/recurring/components/recurring-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recurring" };

export default function RecurringPage() {
  return <RecurringView />;
}
