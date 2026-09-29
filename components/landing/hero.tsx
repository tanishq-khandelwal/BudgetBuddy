"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "./product-preview";

export const Hero = () => {
  const reduce = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 20 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[-10rem] h-[28rem] w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            {...enter(0)}
            className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-success" />
            Budgets, bills and reports in one place
          </motion.p>
          <motion.h1
            {...enter(0.05)}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Know where every dollar <span className="text-primary">goes</span>.
          </motion.h1>
          <motion.p
            {...enter(0.1)}
            className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            BudgetBuddy brings your accounts, transactions, budgets and
            recurring bills together, so you can spend with confidence and save
            on purpose.
          </motion.p>
          <motion.div
            {...enter(0.15)}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/sign-up">
                Get started free <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <a href="#features">See features</a>
            </Button>
          </motion.div>
          <motion.p
            {...enter(0.2)}
            className="mt-4 text-xs text-muted-foreground"
          >
            Free forever · No credit card · Set up in a minute
          </motion.p>
        </div>

        <motion.div
          {...enter(0.3)}
          className="relative mx-auto mt-12 max-w-4xl sm:mt-16"
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
};
