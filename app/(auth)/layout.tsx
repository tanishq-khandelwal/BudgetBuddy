import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthPanel } from "@/components/landing/auth-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2 xl:grid-cols-[1fr_1.1fr]">
      <div className="relative flex flex-col overflow-hidden px-4 py-5 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="relative flex flex-1 items-center justify-center py-8">
          {children}
        </div>
        <p className="relative text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BudgetBuddy
        </p>
      </div>
      <AuthPanel />
    </div>
  );
}
