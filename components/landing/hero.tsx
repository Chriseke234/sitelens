import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "@/components/landing/product-preview";
import { Search, ShieldCheck, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-2 border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />
            Website Intelligence & Media Authenticity
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.15]">
            Know what&apos;s wrong with your website.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            SiteLens analyzes websites and digital media to uncover problems, surface evidence, and give you practical recommendations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-6">
                <Search className="h-4 w-4" />
                <span>Audit a website</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#media-proof" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6">
                <ShieldCheck className="h-4 w-4" />
                <span>Check media</span>
              </Button>
            </Link>
          </div>

          {/* Restrained Trust Line */}
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Website intelligence and digital media analysis in one workspace.
          </p>
        </div>

        {/* Dashboard Preview Component */}
        <div className="mt-14 md:mt-16">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
