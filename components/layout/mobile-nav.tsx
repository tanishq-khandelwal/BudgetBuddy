"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  PiggyBank,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { NAV_SECTIONS, isActivePath } from "./nav-config";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
];

// Phone/tablet (< lg): a bottom tab bar with a centre "add" button, plus a
// drawer holding every page.
export const MobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const newTransaction = useNewTransaction();

  const tab = (t: (typeof TABS)[number]) => {
    const active = isActivePath(pathname, t.href);
    return (
      <Link
        key={t.href}
        href={t.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <t.icon className="size-5" />
        {t.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
          {tab(TABS[0])}
          {tab(TABS[1])}
          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={newTransaction.onOpen}
              aria-label="New transaction"
              className="flex size-12 -translate-y-3 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
            >
              <Plus className="size-6" />
            </button>
          </div>
          {tab(TABS[2])}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
          >
            <Menu className="size-5" />
            More
          </button>
        </div>
      </nav>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <div className="pb-safe max-h-[70dvh] space-y-5 overflow-y-auto px-4 pb-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors",
                          active
                            ? "border-primary/40 bg-primary/5 text-foreground"
                            : "bg-card hover:bg-accent",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-[18px]",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
