import { DataCardLoading } from "@/components/data-card";
import { DataChartsLoading } from "@/components/data-charts";
import { AccountFilter } from "@/components/account-filter";
import { DateFilter } from "@/components/date-filter";

export default function Loading() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <AccountFilter />
        <DateFilter />
      </div>
      <DataChartsLoading />
    </div>
  );
}
