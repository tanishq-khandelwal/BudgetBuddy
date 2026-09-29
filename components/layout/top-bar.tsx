"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./logo";
import { CommandMenu } from "./command-menu";
import { ThemeToggle } from "./theme-toggle";

export const TopBar = () => (
  <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6">
    <Logo href="/dashboard" showText={false} className="lg:hidden" />
    <div className="min-w-0 flex-1">
      <CommandMenu />
    </div>
    <ThemeToggle />
    <div className="flex size-9 items-center justify-center">
      <ClerkLoaded>
        <UserButton
          appearance={{ elements: { avatarBox: "size-8 ring-2 ring-border" } }}
        />
      </ClerkLoaded>
      <ClerkLoading>
        <Skeleton className="size-8 rounded-full" />
      </ClerkLoading>
    </div>
  </header>
);
