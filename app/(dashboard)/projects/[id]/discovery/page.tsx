"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { DiscoveryQnA } from "@/types";

export default function DiscoveryPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [qnaList, setQnaList] = useState<DiscoveryQnA[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQnA();
  }, [projectId]);

  const fetchQnA = async () => {
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
      }
    } catch (err) {
      console.error("Failed to load discovery questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (qnaId: string) => {
    setSavingId(qnaId);
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qnaId,
          answer: answers[qnaId] || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.qnaList) {
        setQnaList(data.qnaList);
      }
    } catch (err) {
      console.error("Save answer error:", err);
    } finally {
      setSavingId(null);
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

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;

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
              <Compass className="h-3.5 w-3.5" />
              Progressive Discovery Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Product Context Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Answer tailored discovery questions to clarify target users, friction points, core actions, and business metrics.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs font-semibold text-slate-500">Discovery Progress</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {answeredCount} / {qnaList.length} Answered
            </div>
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {qnaList.map((qna, idx) => {
          const isAnswered = qna.answer && qna.answer.trim().length > 0;
          return (
            <div
              key={qna.id}
              className={`rounded-2xl border p-6 transition-all ${
                isAnswered
                  ? "border-emerald-200 bg-white dark:border-emerald-950/60 dark:bg-slate-900"
                  : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {qna.question}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Step {qna.step_order} • Focus: Product Scope & Customer Value
                    </p>
                  </div>
                </div>

                {isAnswered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Answered
                  </span>
                )}
              </div>

              <div className="mt-4">
                <textarea
                  rows={2}
                  placeholder="Type your response here..."
                  value={answers[qna.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [qna.id]: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(qna.id)}
                    disabled={savingId === qna.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-blue-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-blue-600 dark:hover:text-white"
                  >
                    {savingId === qna.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Answer
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
            Need More Discovery Depth?
          </h4>
          <p className="text-xs text-slate-500">
            Your AI Product Manager can generate deeper follow-up questions based on your latest answers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateMore}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Follow-ups...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Dynamic Follow-up Questions
            </>
          )}
        </button>
      </div>
    </div>
  );
}
