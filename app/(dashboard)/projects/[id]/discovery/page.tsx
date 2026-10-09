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
      <div className="flex h-64 items-center justify-center border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <Loader2 className="h-8 w-8 animate-spin text-[#080808]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Stage Header */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <Compass className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>STAGE 01 · UNDERSTAND & DISCOVERY</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
              Clarify Core Decisions
            </h1>
            <p className="text-xs font-medium text-[#080808]/80 sm:text-sm max-w-2xl">
              Answer essential questions so your AI agent knows what to build and what to leave alone. Don&apos;t know an answer? Click &quot;Recommend for me&quot; and Aigenstra will set a safe architectural default.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-right shadow-[3px_3px_0px_#080808]">
              <div className="text-[10px] font-black uppercase text-[#080808]/60">Decided</div>
              <div className="text-xl font-black text-[#080808]">
                {answeredCount} / {qnaList.length}
              </div>
            </div>

            {isSufficient && (
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generating}
                className="inline-flex items-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] px-4 py-3 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:bg-[#080808] hover:text-[#FFE500] active:translate-x-0.5 active:translate-y-0.5"
              >
                <FileCheck2 className="h-4 w-4 stroke-[2.5]" />
                <span>View Summary →</span>
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
      <div className="space-y-4">
        {qnaList.map((qna, idx) => {
          const isAnswered = Boolean(qna.answer && qna.answer.trim().length > 0);
          const isMustKnow = qna.category === "MUST_KNOW" || idx === 0;

          return (
            <div
              key={qna.id}
              className={`border-[3px] border-[#080808] p-5 transition-all ${
                isAnswered
                  ? "bg-white shadow-[5px_5px_0px_#080808]"
                  : "bg-white shadow-[5px_5px_0px_#080808]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-[#080808] bg-[#FFE500] text-xs font-black text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`border border-[#080808] px-2 py-0.5 text-[10px] font-black uppercase ${
                          isMustKnow
                            ? "bg-[#FFE500] text-[#080808]"
                            : "bg-[#F8F6EC] text-[#080808]"
                        }`}
                      >
                        {isMustKnow ? "MUST KNOW" : "HELPFUL"}
                      </span>

                      {isAnswered && (
                        <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                          <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                          DECIDED
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-black uppercase text-[#080808] sm:text-lg">
                      {qna.question}
                    </h3>
                  </div>
                </div>

                {/* "Why we're asking" toggle */}
                <button
                  type="button"
                  onClick={() => toggleWhy(qna.id)}
                  className="flex items-center gap-1 border border-[#080808] bg-[#F8F6EC] px-2.5 py-1 text-[11px] font-bold uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808] hover:bg-white self-start sm:self-auto shrink-0"
                >
                  <Info className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Why we ask</span>
                  {expandedWhy[qna.id] ? (
                    <ChevronUp className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="h-3 w-3 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Expandable "Why We're Asking" Context */}
              {expandedWhy[qna.id] && (
                <div className="mt-3 border-2 border-[#080808] bg-[#F8F6EC] p-3 text-xs text-[#080808] shadow-[2px_2px_0px_#080808]">
                  <div className="flex items-center gap-1.5 font-black uppercase mb-1">
                    <Lightbulb className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                    <span>How this helps your AI coding agent:</span>
                  </div>
                  <p className="text-[11px] font-medium text-[#080808]/80 leading-relaxed">
                    This decision defines your core schema, routes, and constraints before code generation. Clear answers eliminate hallucinated boilerplate and prevent wasted tokens.
                  </p>
                </div>
              )}

              {/* Quick Actions & Input */}
              <div className="mt-4 pt-4 border-t-2 border-[#080808]/15">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id, "Yes, this is required for our core experience.")}
                    className="border-2 border-[#080808] bg-white px-3 py-1 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] active:translate-y-0.5"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id, "No, we do not need this for the initial version.")}
                    className="border-2 border-[#080808] bg-white px-3 py-1 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] active:translate-y-0.5"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDontKnow(qna)}
                    className="border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-white active:translate-y-0.5"
                  >
                    I don&apos;t know — Recommend for me
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Or write your requirement or preference..."
                  value={answers[qna.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [qna.id]: e.target.value })}
                  className="w-full border-2 border-[#080808] bg-[#F8F6EC] p-3 font-mono text-xs text-[#080808] placeholder:text-[#080808]/40 focus:bg-white focus:outline-none focus:ring-0"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id)}
                    disabled={savingId === qna.id}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#080808] px-4 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] hover:text-[#080808] disabled:opacity-50"
                  >
                    {savingId === qna.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                    Save Decision
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Advance Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-[3px] border-[#080808] bg-[#F8F6EC] p-6 shadow-[5px_5px_0px_#080808]">
        <div>
          <h4 className="text-sm font-black uppercase text-[#080808]">
            Need more decisions clarified?
          </h4>
          <p className="text-xs font-medium text-[#080808]/75">
            Aigenstra analyzes your responses and checks if any critical edge cases remain unaddressed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateMore}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-white px-4 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#FFE500] disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Decisions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 stroke-[2.5]" />
                Check For Missing Decisions
              </>
            )}
          </button>

          {isSufficient && (
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="inline-flex items-center justify-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500]"
            >
              <FileCheck2 className="h-4 w-4 stroke-[2.5]" />
              <span>Advance to Stage 02: Blueprint →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
