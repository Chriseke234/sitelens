import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, HelpCircle, CheckCircle2, FileSearch } from "lucide-react";

export function ReportPreview() {
  return (
    <section id="reports" className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Actionable Reports
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            Don&apos;t just find problems. Know what to do next.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every finding includes supporting evidence, rationale, and exact recommendations so teams can execute fixes quickly.
          </p>
        </div>

        {/* Detailed Report Card Mockup */}
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Audit Finding Detail
              </span>
            </div>
            <Badge variant="destructive" className="px-3 py-0.5 text-xs font-semibold">
              High priority
            </Badge>
          </div>

          <div className="mt-6 space-y-6">
            {/* Finding */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  What we found
                </h4>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                Primary CTA lacks clarity
              </p>
            </div>

            {/* Evidence & Rationale Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Evidence */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileSearch className="h-4 w-4 text-slate-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Supporting Evidence
                  </h4>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Multiple secondary links compete with the primary action in the first viewport.
                </p>
              </div>

              {/* Why It Matters */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <HelpCircle className="h-4 w-4 text-slate-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Why It Matters
                  </h4>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Visitors may not immediately understand the intended next action.
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-4 dark:border-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-600">
                  Recommended Action
                </h4>
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                Create a visually dominant CTA aligned with the page&apos;s primary conversion goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
