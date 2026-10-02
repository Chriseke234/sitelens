import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Rocket,
  ArrowRight,
  Database,
  Smartphone,
  Globe,
  Terminal,
  Code2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { STARTER_TEMPLATES } from "@/lib/templates/data";

export const metadata = {
  title: "Project Templates | Aigenstra",
  description: "Jumpstart your product engineering with pre-structured Aigenstra templates.",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
            Pre-Structured Engineering Architectures
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Product Templates
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Start from battle-tested architecture foundations and jump straight into specialized AI agent council debates and build prompts.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 btn-interactive shrink-0"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>Start Blank Project</span>
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STARTER_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 card-hover-effect"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {tpl.category}
                </span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                  {tpl.techStack.split(",")[0]}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tpl.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {tpl.description}
              </p>

              {/* Stage Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tpl.stages.map((stg, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    • {stg}
                  </span>
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                {tpl.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                href={`/projects/new?template=${tpl.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 btn-interactive"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>Use This Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
