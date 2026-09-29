import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import {
  Faq,
  FinalCta,
  Features,
  HowItWorks,
  Security,
  Stats,
} from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "BudgetBuddy: budgets, bills and reports in one place",
  description:
    "Track accounts and transactions, set monthly budgets, automate recurring bills and see where your money goes. Free forever.",
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Security />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
