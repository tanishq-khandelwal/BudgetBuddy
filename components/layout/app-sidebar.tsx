"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { LogOut, PanelLeftClose, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { Logo } from "./logo";
import { NAV_SECTIONS, isActivePath } from "./nav-config";
import { useSidebar } from "./use-sidebar";

// Desktop-only (lg+). Mobile navigation lives in mobile-nav.tsx.
export const AppSidebar = () => {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const newTransaction = useNewTransaction();
  const clerk = useClerk();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {collapsed ? (
            <Logo
              showText={false}
              onClick={toggle}
              aria-label="Expand sidebar"
            />
          ) : (
            <Logo href="/dashboard" />
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              onClick={toggle}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        <div className={cn("p-3", collapsed && "px-2")}>
          <SidebarTooltip label="New transaction" show={collapsed}>
            <Button
              onClick={newTransaction.onOpen}
              className={cn(
                "w-full shadow-sm shadow-primary/20",
                collapsed && "px-0",
              )}
            >
              <Plus className="size-4" />
              {!collapsed && "New transaction"}
            </Button>
          </SidebarTooltip>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <SidebarTooltip
                    key={item.href}
                    label={item.label}
                    show={collapsed}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent text-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && item.label}
                    </Link>
                  </SidebarTooltip>
                );
              })}
            </div>
          ))}
        </nav>

        <div
          className={cn(
            "border-t border-sidebar-border p-3",
            collapsed && "px-2",
          )}
        >
          <SidebarTooltip label="Sign out" show={collapsed}>
            <Button
              variant="ghost"
              onClick={() => clerk.signOut({ redirectUrl: "/" })}
              aria-label={collapsed ? "Sign out" : undefined}
              className={cn(
                "h-9 w-full justify-start gap-3 px-3 text-sidebar-foreground/80 hover:text-destructive",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className="size-[18px] shrink-0" />
              {!collapsed && "Sign out"}
            </Button>
          </SidebarTooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

const SidebarTooltip = ({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: React.ReactNode;
}) => {
  if (!show) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};
