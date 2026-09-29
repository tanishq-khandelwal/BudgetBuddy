import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";

// Every page here reads the signed-in user and URL filters at request time.
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/* Bottom padding keeps content clear of the mobile tab bar. */}
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense>{children}</Suspense>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
