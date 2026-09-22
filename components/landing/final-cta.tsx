import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="border-t border-slate-200/80 bg-slate-900 text-white py-16 md:py-24 dark:bg-slate-950 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
            See what your website is missing.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Turn a website URL into a clearer picture of its strengths, weaknesses, and opportunities.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-100 dark:text-slate-900">
                <Search className="h-4 w-4" />
                <span>Audit a website</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#capabilities" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-700 bg-slate-800 text-white hover:bg-slate-700 dark:border-slate-800 dark:bg-slate-900"
              >
                <span>Explore SiteLens</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
