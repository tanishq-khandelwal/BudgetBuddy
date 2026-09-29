import { cn } from "@/lib/utils";

// Stable color per category name, picked from the chart-1..5 theme tokens.
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const categoryColor = (name: string) =>
  `hsl(var(--chart-${(hash(name.trim().toLowerCase()) % 5) + 1}))`;

/** Rounded square with the category's initial. */
export const CategoryAvatar = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const color = categoryColor(name);
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold uppercase",
        className,
      )}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
};

/** Small pill with a colored dot. */
export const CategoryChip = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium",
      className,
    )}
  >
    <span
      aria-hidden
      className="size-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: categoryColor(name) }}
    />
    <span className="truncate">{name}</span>
  </span>
);
