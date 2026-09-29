import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  showText?: boolean;
  className?: string;
  /** Renders a button instead of a link. */
  onClick?: () => void;
  "aria-label"?: string;
};

export const Logo = ({
  href = "/",
  showText = true,
  className,
  onClick,
  "aria-label": ariaLabel,
}: Props) => {
  const classes = cn(
    "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
  const content = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
        <Image src="/logo.svg" alt="" width={20} height={12} priority />
      </span>
      {showText && (
        <span className="text-[15px] font-semibold tracking-tight">
          BudgetBuddy
        </span>
      )}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  ) : (
    <Link href={href} aria-label={ariaLabel} className={classes}>
      {content}
    </Link>
  );
};
