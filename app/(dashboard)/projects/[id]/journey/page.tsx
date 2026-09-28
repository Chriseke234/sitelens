"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  GitFork,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  User,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";
import { UserJourney } from "@/types";

export default function UserJourneyPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [journeyDoc, setJourneyDoc] = useState<UserJourney | null>(null);

  useEffect(() => {
    fetchJourney();
  }, [projectId]);

  const fetchJourney = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/journey`);
      const data = await res.json();
      if (res.ok && data.journeyDoc) {
        setJourneyDoc(data.journeyDoc);
      }
    } catch (err) {
      console.error("Failed to load user journey:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJourney = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/journey`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.journeyDoc) {
        setJourneyDoc(data.journeyDoc);
      }
    } catch (err) {
      console.error("Generate user journey error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <GitFork className="h-3.5 w-3.5" />
              Visual User Journey Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Customer Journey & Interaction Flow
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Interactive node pathways for happy paths, edge cases, error states, and security checks across every user action.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateJourney}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Journey...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {journeyDoc ? "Re-Generate Journey" : "Generate User Journey"}
              </>
            )}
          </button>
        </div>
      </div>

      {!journeyDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <GitFork className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            User Journey Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to generate a step-by-step visual user journey with happy paths, friction points, and edge cases.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Persona Header & Happy Path Pills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Target Persona: {journeyDoc.persona}
                </h3>
                <p className="text-xs text-slate-500">{journeyDoc.title}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Happy Path Progression:
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {journeyDoc.happy_path.map((node, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {idx + 1}. {node}
                    </span>
                    {idx < journeyDoc.happy_path.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Pathway Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Journey Stages & Security Controls
            </h3>

            {journeyDoc.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500/50 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                      {step.stepNumber}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500">User Goal: {step.userGoal}</p>
                    </div>
                  </div>

                  {step.security && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      {step.security}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      User Action
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {step.userAction}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      System Response
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {step.systemResponse}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 dark:border-amber-950/40 dark:bg-amber-950/20">
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Potential Friction
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {step.friction || "None identified"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edge Cases & Failure Recovery Paths */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edge Cases & Resolutions
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {journeyDoc.edge_cases.map((ec, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Scenario: {ec.scenario}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Resolution: {ec.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm dark:border-rose-950/40 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3 dark:border-rose-950">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Failure Recovery Paths
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {journeyDoc.failure_paths.map((fp, idx) => (
                  <div key={idx} className="rounded-xl border border-rose-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
                      Trigger: {fp.trigger}
                    </div>
                    <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                      Message: &quot;{fp.userMessage}&quot;
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      Fallback: {fp.fallbackAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
