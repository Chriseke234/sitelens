import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "@/components/landing/product-preview";
import { Sparkles, ArrowRight, Layers, Terminal, SearchCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-2 border border-indigo-500/20 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900/50 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-full"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Product Engineering & Audit Platform for Vibe Coders</span>
          </Badge>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.12] font-sans">
            Think before you vibe.
            <span className="text-indigo-600 dark:text-indigo-400 block mt-2 font-black">
              From idea to verified product.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            Aigenstra helps vibe coders plan products, reason through engineering trade-offs, generate 16-part implementation prompts, and audit what they build before shipping.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="/projects/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/25 btn-interactive">
                <Terminal className="h-4 w-4" />
                <span>Start a Project</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#templates" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8 rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 font-bold dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 btn-interactive">
                <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Browse Starter Templates</span>
              </Button>
            </Link>
          </div>

          {/* Tagline */}
          <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Think → Research → Plan → Debate → Prompt → Build → Audit → Fix → Verify → Ship
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
