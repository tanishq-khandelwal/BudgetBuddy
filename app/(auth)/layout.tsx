import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthPanel } from "@/components/landing/auth-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          {children}
        </div>
      </div>
      <AuthPanel />
    </div>
  );
}
