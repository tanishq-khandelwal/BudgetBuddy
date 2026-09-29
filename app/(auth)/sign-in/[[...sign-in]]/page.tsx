import { SignIn, ClerkFailed, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <div className="flex w-full max-w-[25rem] flex-col items-center gap-6">
      <ClerkLoaded>
        <SignIn path="/sign-in" />
      </ClerkLoaded>
      <ClerkLoading>
        <div
          className="w-full space-y-4 rounded-2xl border p-8"
          aria-busy="true"
        >
          <Skeleton className="mx-auto h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </ClerkLoading>
      <ClerkFailed>
        <p className="w-full rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Sign-in couldn&apos;t load. Check your connection and refresh the
          page.
        </p>
      </ClerkFailed>
      <p className="text-sm text-muted-foreground">
        New to BudgetBuddy?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
