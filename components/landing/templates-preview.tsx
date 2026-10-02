import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  ArrowRight,
  Rocket,
  CheckCircle2,
  Sparkles,
  Database,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { STARTER_TEMPLATES } from "@/lib/templates/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TemplatesPreview() {
  return (
    <section id="templates" className="relative py-20 bg-slate-900 text-white dark:bg-slate-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Architecture Starter Blueprints</span>
          </Badge>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl font-sans">
            Start with proven foundation.{" "}
            <span className="block mt-1 bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Jump straight into AI Agent debate.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Choose a production-vetted architecture template. Aigenstra pre-structures your database schema, security guardrails, and implementation prompts.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {STARTER_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/50 hover:shadow-cyan-500/10 card-hover-effect"
            >
              <div>
                {/* Template Visual Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <Image
                    src={tpl.imageUrl}
                    alt={tpl.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-slate-900/90 border border-slate-700/80 px-3 py-1 text-[11px] font-bold text-cyan-300 backdrop-blur-md">
                      {tpl.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-cyan-400 font-bold">{tpl.category}</span>
                    <span className="truncate max-w-[170px]">{tpl.techStack.split(",")[0]}</span>
                  </div>

                  <h3 className="mt-2.5 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tpl.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Highlighted Feature Bullets */}
                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
                    {tpl.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link
                  href={`/projects/new?template=${tpl.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all group-hover:brightness-110 active:scale-98 btn-interactive"
                >
                  <Rocket className="h-3.5 w-3.5" />
                  <span>Use This Starter Template</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 sm:p-8 text-center backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Have a completely custom product idea?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                You can start from scratch with messy bullet points. Our AI PM and Architect will guide your discovery.
              </p>
            </div>
            <Link href="/projects/new">
              <Button className="rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-6 py-2.5 btn-interactive border border-slate-700 gap-2 shrink-0">
                <span>Start from Scratch</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
