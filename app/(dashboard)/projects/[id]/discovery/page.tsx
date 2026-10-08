"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Plus,
  Loader2,
  Save,
  ArrowRight,
  ShieldCheck,
  Lightbulb,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from "lucide-react";
import { DiscoveryQnA, ProductSummary, ProductAssumption } from "@/types";
import { ProductSummaryView } from "@/components/projects/product-summary-view";

export default function DiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmingStage, setConfirmingStage] = useState(false);
  const [qnaList, setQnaList] = useState<DiscoveryQnA[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [assumptions, setAssumptions] = useState<ProductAssumption[]>([]);

  useEffect(() => {
    fetchDiscoveryData();
  }, [projectId]);

  const fetchDiscoveryData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`);
      const data = await res.json();
      if (res.ok && data.qnaList) {
        setQnaList(data.qnaList);
        const initialAnswers: Record<string, string> = {};
        data.qnaList.forEach((q: DiscoveryQnA) => {
          initialAnswers[q.id] = q.answer || "";
        });
        setAnswers(initialAnswers);
        if (data.assumptions) {
          setAssumptions(data.assumptions);
        }
      }
    } catch (err) {
      console.error("Failed to load discovery questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (qnaId: string, customAnswer?: string) => {
    setSavingId(qnaId);
    const finalAnswer = customAnswer !== undefined ? customAnswer : (answers[qnaId] || "");
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qnaId,
          answer: finalAnswer,
        }),
      });
      const data = await res.json();
      if (res.ok && data.qnaList) {
        setQnaList(data.qnaList);
        setAnswers((prev) => ({ ...prev, [qnaId]: finalAnswer }));
      }
    } catch (err) {
      console.error("Save answer error:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDontKnow = async (qna: DiscoveryQnA) => {
    const defaultText = "Provisional recommendation: Enabled based on standard product architecture. (You can change this anytime)";
    setAnswers((prev) => ({ ...prev, [qna.id]: defaultText }));
    setSavingId(qna.id);
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qnaId: qna.id,
          answer: defaultText,
          action: "apply_default_assumption",
          assumption: `Assumption for: ${qna.question} — ${defaultText}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.qnaList) {
        setQnaList(data.qnaList);
      }
    } catch (err) {
      console.error("Default assumption error:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_summary" }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setSummary(data.summary);
        setShowSummaryModal(true);
      }
    } catch (err) {
      console.error("Generate summary error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmSummary = async () => {
    setConfirmingStage(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "advance_to_planning" }),
      });
      if (res.ok) {
        router.push(`/projects/${projectId}/product`);
      }
    } catch (err) {
      console.error("Advance to planning error:", err);
      setConfirmingStage(false);
    }
  };

  const handleGenerateMore = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_more" }),
      });
      const data = await res.json();
      if (res.ok && data.qnaList) {
        setQnaList(data.qnaList);
        const updatedAnswers: Record<string, string> = { ...answers };
        data.qnaList.forEach((q: DiscoveryQnA) => {
          if (updatedAnswers[q.id] === undefined) {
            updatedAnswers[q.id] = q.answer || "";
          }
        });
        setAnswers(updatedAnswers);
      }
    } catch (err) {
      console.error("Generate follow-ups error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleWhy = (id: string) => {
    setExpandedWhy((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;
  const isSufficient = answeredCount >= 2;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Compass className="h-3.5 w-3.5" />
              Adaptive Discovery Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Product Discovery & Decisions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Aigenstra asks only essential questions to understand what your product needs before creating blueprints and coding prompts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs font-semibold text-slate-500">Discovery Progress</div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {answeredCount} / {qnaList.length} Decided
              </div>
            </div>

            {isSufficient && (
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 btn-interactive"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>View Product Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Summary Modal / View */}
      {showSummaryModal && summary && (
        <ProductSummaryView
          summary={summary}
          onConfirm={handleConfirmSummary}
          confirming={confirmingStage}
          onRevise={() => setShowSummaryModal(false)}
        />
      )}

      {/* Questions Stack */}
      <div className="space-y-6">
        {qnaList.map((qna, idx) => {
          const isAnswered = Boolean(qna.answer && qna.answer.trim().length > 0);
          const isMustKnow = qna.category === "MUST_KNOW" || idx === 0;
          const isOptional = qna.category === "OPTIONAL";

          return (
            <div
              key={qna.id}
              className={`rounded-2xl border p-6 transition-all ${
                isAnswered
                  ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/60 dark:bg-slate-900"
                  : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isMustKnow
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : isOptional
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                        }`}
                      >
                        {isMustKnow ? "Must Know" : isOptional ? "Optional" : "Helpful"}
                      </span>

                      {isAnswered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Decided
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {qna.question}
                    </h3>
                  </div>
                </div>

                {/* "Why we're asking" toggle */}
                <button
                  type="button"
                  onClick={() => toggleWhy(qna.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 self-start sm:self-auto"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Why we&apos;re asking</span>
                  {expandedWhy[qna.id] ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>

              {/* Expandable "Why We're Asking" Context */}
              {expandedWhy[qna.id] && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 dark:border-indigo-950/50 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>How this affects your product:</span>
                  </div>
                  <p className="leading-relaxed">
                    This decision determines the required database models, authentication boundaries, and permission rules for your coding prompt. Answering clearly ensures the coding agent builds the correct architecture on the first try.
                  </p>
                </div>
              )}

              {/* Quick Actions & Input */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id, "Yes, this is required for our core experience.")}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id, "No, we do not need this for the initial version.")}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDontKnow(qna)}
                    className="rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                  >
                    I don&apos;t know — Recommend for me
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Or describe your preference in your own words..."
                  value={answers[qna.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [qna.id]: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id)}
                    disabled={savingId === qna.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 btn-interactive"
                  >
                    {savingId === qna.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Decision
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Need to Clarify More Decisions?
          </h4>
          <p className="text-xs text-slate-500">
            Aigenstra can analyze your current decisions and identify if any critical architectural unknowns remain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateMore}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 btn-interactive"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking for Missing Decisions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Check for Missing Decisions
              </>
            )}
          </button>

          {isSufficient && (
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 btn-interactive"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Review Product Summary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
