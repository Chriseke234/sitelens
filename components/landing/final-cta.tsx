import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="border-t border-slate-200/80 bg-slate-900 text-white py-16 md:py-24 dark:bg-slate-950 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white font-sans">
            See what your website is missing
            <span className="font-cursive text-blue-400 block text-2xl sm:text-3xl md:text-4xl mt-2 font-normal">
              in minutes with deterministic intelligence
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Turn any website URL into an actionable roadmap of technical SEO, performance, UX, and conversion opportunities.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/30 btn-interactive">
                <Search className="h-4 w-4" />
                <span>Start Free Audit</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#capabilities" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-slate-700 bg-slate-800/80 text-white font-bold hover:bg-slate-700 dark:border-slate-800 dark:bg-slate-900 btn-interactive"
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
