import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "@/components/landing/product-preview";
import { Search, ShieldCheck, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-2 border border-slate-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 rounded-full"
          >
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Website Intelligence & Media Authenticity</span>
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.15] font-sans">
            Understand your website&apos;s real health
            <span className="font-cursive text-blue-600 dark:text-blue-400 text-3xl sm:text-4xl md:text-5xl block mt-2 font-normal">
              with evidence-based intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            SiteLens inspects websites and digital media to surface exact SEO, performance, UX, accessibility, and authenticity insights with clear actionable recommendations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/25 btn-interactive">
                <Search className="h-4 w-4" />
                <span>Start Free Audit</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8 rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 font-bold dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 btn-interactive">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>How It Works</span>
              </Button>
            </Link>
          </div>

          {/* Restrained Trust Line */}
          <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Automated technical auditing and media provenance verification in one workspace.
          </p>
        </div>

        {/* Dashboard Preview Component */}
        <div className="mt-14 md:mt-16 card-hover-effect rounded-2xl">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
