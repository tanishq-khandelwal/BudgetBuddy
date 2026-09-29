import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Your financial snapshot",
      },
      {
        href: "/transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
        description: "Every income and expense",
      },
      {
        href: "/reports",
        label: "Reports",
        icon: BarChart3,
        description: "Trends and breakdowns",
      },
    ],
  },
  {
    title: "Planning",
    items: [
      {
        href: "/budgets",
        label: "Budgets",
        icon: PiggyBank,
        description: "Monthly limits per category",
      },
      {
        href: "/recurring",
        label: "Recurring",
        icon: Repeat,
        description: "Bills, salary, subscriptions",
      },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        href: "/accounts",
        label: "Accounts",
        icon: Wallet,
        description: "Bank, cash and cards",
      },
      {
        href: "/categories",
        label: "Categories",
        icon: Tags,
        description: "Organize your spending",
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Preferences and data",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
