import { cn } from "@/lib/utils";

export const budgetState = (percentage: number) =>
  percentage > 100 ? "over" : percentage > 75 ? "warn" : "ok";

const fill = {
  ok: "bg-primary",
  warn: "bg-warning",
  over: "bg-destructive",
};

type Props = {
  percentage: number;
  label: string;
  className?: string;
};

// Progress bar colored by budget state (<=75% ok, <=100% warning, else over).
export const BudgetBar = ({ percentage, label, className }: Props) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.min(Math.round(percentage), 100)}
    className={cn(
      "h-2 w-full overflow-hidden rounded-full bg-muted",
      className,
    )}
  >
    <div
      className={cn(
        "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
        fill[budgetState(percentage)],
      )}
      style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
    />
  </div>
);
