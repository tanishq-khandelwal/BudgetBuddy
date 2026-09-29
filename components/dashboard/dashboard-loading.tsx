import { DataCardLoading } from "@/components/data-card";
import { DataChartsLoading } from "@/components/data-charts";
import { RecentTransactionsLoading } from "@/components/dashboard/recent-transactions";

// Mirrors the final dashboard grid so nothing jumps when data arrives.
export const DashboardLoading = () => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DataCardLoading key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <DataChartsLoading />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <RecentTransactionsLoading />
    </div>
  </div>
);
