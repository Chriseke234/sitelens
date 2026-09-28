"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  ShieldAlert,
  Loader2,
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { ResearchDocument } from "@/types";

export default function ResearchPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [researchDoc, setResearchDoc] = useState<ResearchDocument | null>(null);

  useEffect(() => {
    fetchResearch();
  }, [projectId]);

  const fetchResearch = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/research`);
      const data = await res.json();
      if (res.ok && data.researchDoc) {
        setResearchDoc(data.researchDoc);
      }
    } catch (err) {
      console.error("Failed to load research document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResearch = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/research`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.researchDoc) {
        setResearchDoc(data.researchDoc);
      }
    } catch (err) {
      console.error("Generate research error:", err);
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
              <BookOpen className="h-3.5 w-3.5" />
              AI Research & Intelligence Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Market & User Research
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Synthesized market trends, target user pain points, competitor differentiation, and explicit hypothesis tagging.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateResearch}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synthesizing Research...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {researchDoc ? "Re-Synthesize Research" : "Generate Research Synthesis"}
              </>
            )}
          </button>
        </div>
      </div>

      {!researchDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Research Synthesis Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI Research Agent and generate market context, competitor breakdowns, user needs, and hypothesis tagging.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Market & User Context */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Market Context
                </h3>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {researchDoc.market_context}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  User Context & Demographics
                </h3>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {researchDoc.user_context}
              </p>
            </div>
          </div>

          {/* Explicit Information Separation Banner */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Information Verification & Hypothesis Tagging
            </div>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
              Aigenstra strictly separates verified facts, user-provided assumptions, and AI hypotheses to eliminate false confidence.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Verified Facts
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {researchDoc.user_needs.slice(0, 2).map((need, idx) => (
                    <li key={idx}>• {need}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <HelpCircle className="h-4 w-4" />
                  Unverified Assumptions
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {researchDoc.assumptions.map((asm, idx) => (
                    <li key={idx}>• {asm.assumption}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Lightbulb className="h-4 w-4" />
                  AI Hypotheses
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {researchDoc.hypotheses.map((hyp, idx) => (
                    <li key={idx}>• {hyp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Competitor Analysis Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Competitor & Alternative Breakdown
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {researchDoc.competitor_analysis.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {comp.name}
                  </h4>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Strengths:</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{comp.strengths}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Weaknesses:</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{comp.weaknesses}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Your Differentiation:</span>{" "}
                      <span className="text-slate-900 font-medium dark:text-slate-200">{comp.differentiation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
