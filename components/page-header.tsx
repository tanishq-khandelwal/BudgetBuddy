import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: React.ReactNode;
  /** Buttons or filters, shown right of the title on desktop and below it on mobile. */
  actions?: React.ReactNode;
  className?: string;
};

// Top of every dashboard page. Use this instead of ad-hoc headings so pages
// share spacing and typography.
export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: Props) => (
  <div
    className={cn(
      "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
      className,
    )}
  >
    <div className="min-w-0 space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {actions}
      </div>
    )}
  </div>
);
