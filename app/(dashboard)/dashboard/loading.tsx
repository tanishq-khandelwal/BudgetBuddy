import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <Skeleton className="h-10 w-full sm:w-[180px]" />
            <Skeleton className="h-10 w-full sm:w-[210px]" />
          </>
        }
      />
      <DashboardLoading />
    </>
  );
}
