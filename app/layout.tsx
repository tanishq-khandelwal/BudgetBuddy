import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { QueryProviders } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemedClerkProvider } from "@/providers/clerk-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "BudgetBuddy — Personal finance, beautifully simple",
    template: "%s · BudgetBuddy",
  },
  description:
    "Track income and expenses, set budgets, automate recurring bills, and see where your money goes — all in one beautiful dashboard.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ThemedClerkProvider>
            <QueryProviders>
              <SheetProvider />
              <Toaster richColors closeButton position="top-right" />
              {children}
            </QueryProviders>
          </ThemedClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
