import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sign up · BudgetBuddy" };

export default function Page() {
  return (
    <div className="flex w-full max-w-[25rem] flex-col items-center gap-6">
      <ClerkLoaded>
        <SignUp path="/sign-up" />
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
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
