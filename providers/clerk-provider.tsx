"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

// Clerk's widgets (sign-in, user menu, profile) follow the app's light/dark theme.
export function ThemedClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        theme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: resolvedTheme === "dark" ? "#8b87f5" : "#4f46e5",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
