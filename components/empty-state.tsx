import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

// Shown wherever a list or chart has nothing to display yet.
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Props) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
      className,
    )}
  >
    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
      <Icon className="size-6" />
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
