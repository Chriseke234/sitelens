"use client";

import React from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Users,
  Lightbulb,
  Activity,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { ProductSummary, ProductAssumption } from "@/types";

interface ProductSummaryViewProps {
  summary: ProductSummary;
  onConfirm: () => void;
  confirming?: boolean;
  onRevise?: () => void;
}

export function ProductSummaryView({
  summary,
  onConfirm,
  confirming = false,
  onRevise,
}: ProductSummaryViewProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Product Understanding Record
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Here&apos;s what Aigenstra understands
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Review your synthesized product structure before unlocking the Software Blueprint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary.isSufficient ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              Understanding Sufficient
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4" />
              Provisional Draft
            </span>
          )}
        </div>
      </div>

      {/* Grid: What Building & Who For */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            What you&apos;re building
          </div>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-900 dark:text-white">
            {summary.whatBuilding}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Who it&apos;s for
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.whoFor.map((user, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-indigo-100/80 px-3 py-1.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
              >
                {user}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Journeys: Main Customer & Business Experience */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Primary Experiences
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Customer Journey:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {summary.mainExperience}
            </p>
          </div>
          {summary.businessExperience && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Platform / Business Journey:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {summary.businessExperience}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Core Capabilities */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <FileCheck2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Core Platform Capabilities
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {summary.coreCapabilities.map((cap, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions & Open Decisions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Active Assumptions */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Active Assumptions
          </div>
          <div className="space-y-2.5">
            {summary.activeAssumptions.map((asm, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {asm.statement}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                    {asm.status}
                  </span>
                </div>
                {asm.reason && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Reason: {asm.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Decisions Remaining */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Still to Decide / Post-MVP
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {summary.decisionsLeft.map((dec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                <span>{dec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confirmation CTA Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onRevise}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Answer more questions first
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 btn-interactive"
        >
          {confirming ? (
            <span>Saving Plan...</span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Looks Good — Continue to Blueprint</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
