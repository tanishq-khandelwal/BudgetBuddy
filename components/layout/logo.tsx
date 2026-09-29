import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  showText?: boolean;
  className?: string;
};

export const Logo = ({ href = "/", showText = true, className }: Props) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
      <Image src="/logo.svg" alt="" width={20} height={12} priority />
    </span>
    {showText && (
      <span className="text-[15px] font-semibold tracking-tight">
        BudgetBuddy
      </span>
    )}
  </Link>
);
