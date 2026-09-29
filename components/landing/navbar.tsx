"use client";

import { Show } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const AuthButtons = ({ onNavigate }: { onNavigate?: () => void }) => (
  <>
    <Show when="signed-out">
      <Button variant="ghost" asChild className="h-10">
        <Link href="/sign-in" onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Button asChild className="h-10">
        <Link href="/sign-up" onClick={onNavigate}>
          Get started
        </Link>
      </Button>
    </Show>
    <Show when="signed-in">
      <Button asChild className="h-10">
        <Link href="/dashboard" onClick={onNavigate}>
          Open dashboard
        </Link>
      </Button>
    </Show>
  </>
);

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 md:flex">
            <AuthButtons />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-6">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation
              </SheetDescription>
              <nav aria-label="Mobile" className="flex flex-col">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 [&>*]:w-full">
                <AuthButtons onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
