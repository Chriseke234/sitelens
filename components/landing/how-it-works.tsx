import React from "react";
import { Link2, Cpu, FileCheck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Enter your website",
      description: "Give SiteLens a website URL and start an audit.",
      icon: Link2,
    },
    {
      number: "02",
      title: "We analyze it",
      description:
        "SiteLens evaluates measurable website signals and uses AI to interpret findings.",
      icon: Cpu,
    },
    {
      number: "03",
      title: "Get practical recommendations",
      description:
        "See what needs attention, why it matters, and what you can do about it.",
      icon: FileCheck,
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Simple Workflow
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            From URL to actionable insight.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            SiteLens turns technical parsing and qualitative heuristics into clear prioritizations.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between pb-4">
                  <span className="font-mono text-2xl font-extrabold text-slate-400 dark:text-slate-600">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
