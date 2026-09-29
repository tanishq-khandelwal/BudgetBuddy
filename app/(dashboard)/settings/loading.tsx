import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Skeleton className="h-10 w-full lg:h-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
