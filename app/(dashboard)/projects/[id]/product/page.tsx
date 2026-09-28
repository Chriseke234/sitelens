"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileCode2,
  Sparkles,
  Loader2,
  CheckCircle2,
  Ban,
  Target,
  FileCheck,
  ShieldCheck,
  Layers,
  ArrowRight,
  ListTodo,
} from "lucide-react";
import { ProductSpec } from "@/types";

export default function ProductSpecPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [specDoc, setSpecDoc] = useState<ProductSpec | null>(null);

  useEffect(() => {
    fetchSpec();
  }, [projectId]);

  const fetchSpec = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/product`);
      const data = await res.json();
      if (res.ok && data.specDoc) {
        setSpecDoc(data.specDoc);
      }
    } catch (err) {
      console.error("Failed to load product spec:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSpec = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/product`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.specDoc) {
        setSpecDoc(data.specDoc);
      }
    } catch (err) {
      console.error("Generate product spec error:", err);
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
              <FileCode2 className="h-3.5 w-3.5" />
              Product Management & Scope Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Product Specification & Scope
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Structured goals, user stories, non-goals (anti-bloat filter), acceptance criteria, and MVP scope.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateSpec}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Formulating Spec...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {specDoc ? "Re-Generate Spec" : "Generate Product Spec"}
              </>
            )}
          </button>
        </div>
      </div>

      {!specDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FileCode2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Product Specification Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI PM Agent and generate user stories, acceptance criteria, and anti-bloat scope filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Problem Statement & Target Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Problem Statement
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {specDoc.problem_statement}
            </p>

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target User Segments:
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {specDoc.target_users.map((usr, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    • {usr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Goals vs Anti-Bloat Non-Goals */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm dark:border-emerald-950/50 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3 dark:border-emerald-950">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Core Product Goals
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {specDoc.goals.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm dark:border-rose-950/50 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3 dark:border-rose-950">
                <Ban className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Explicit Non-Goals (Anti-Bloat Filter)
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {specDoc.non_goals.map((ng, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Ban className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{ng}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Stories Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Stories & Acceptance Criteria
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {specDoc.user_stories.map((story, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Story #{idx + 1}: {story.title}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {story.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic">
                    "As a <span className="font-semibold text-slate-900 dark:text-white">{story.asA}</span>, I want to <span className="font-semibold text-slate-900 dark:text-white">{story.iWantTo}</span> so that <span className="font-semibold text-slate-900 dark:text-white">{story.soThat}</span>."
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* MVP Scope vs Future Scope */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  MVP Launch Scope
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {specDoc.mvp_scope.map((mvp, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{mvp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                <Layers className="h-5 w-5 text-slate-500" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Future Post-Launch Scope
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                {specDoc.future_scope.map((fut, idx) => (
                  <li key={idx}>• {fut}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
