import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const cols = [
  {
    title: "Product",
    links: [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Security", "#security"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Sign in", "/sign-in"],
      ["Get started", "/sign-up"],
      ["Dashboard", "/dashboard"],
    ],
  },
];

export const Footer = () => (
  <footer className="border-t">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto]">
      <div className="max-w-xs">
        <Logo />
        <p className="mt-3 text-sm text-muted-foreground">
          Simple, private personal finance.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10 sm:gap-16">
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-1">
              {c.links.map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </div>
    <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} BudgetBuddy. All rights reserved.
    </div>
  </footer>
);
