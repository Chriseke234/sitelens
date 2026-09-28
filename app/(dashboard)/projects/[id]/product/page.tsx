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
  ListTodo,
  User,
  AlertOctagon,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { ProductSpec } from "@/types";

export default function ProductSpecPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [specDoc, setSpecDoc] = useState<ProductSpec | null>(null);
  const [copiedPrd, setCopiedPrd] = useState(false);

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

  const handleCopyPrd = () => {
    if (!specDoc) return;
    const prdMarkdown = `# Product Requirements Document (PRD)

## Problem Statement
${specDoc.problem_statement}

## Target Users & Personas
${specDoc.personas?.map((p) => `- **${p.name}** (Technical Ability: ${p.technicalAbility})\n  - **Goal:** ${p.goal}\n  - **Pain:** ${p.pain}\n  - **Primary Task:** ${p.primaryTask}`).join("\n\n") || specDoc.target_users.join(", ")}

## Core Goals
${specDoc.goals.map((g) => `- ${g}`).join("\n")}

## Explicit Non-Goals (Anti-Bloat Filter)
${specDoc.non_goals.map((ng) => `- ${ng}`).join("\n")}

## Functional Requirements
${specDoc.structured_functional_reqs?.map((fr) => `- **[${fr.code}] ${fr.title}** (${fr.priority}): ${fr.description}`).join("\n") || specDoc.functional_reqs.join("\n")}

## Non-Functional Requirements
${specDoc.structured_non_functional_reqs?.map((nfr) => `- **[${nfr.code}] ${nfr.title}** (${nfr.category}): ${nfr.description}`).join("\n") || specDoc.non_functional_reqs.join("\n")}

## Edge Cases
${specDoc.edge_cases?.map((ec) => `- ${ec}`).join("\n") || "Standard input validation edge cases."}

## User Stories
${specDoc.user_stories.map((us) => `- **${us.title}** (${us.priority}): As a ${us.asA}, I want to ${us.iWantTo} so that ${us.soThat}`).join("\n")}

## MVP Scope
${specDoc.mvp_scope.map((mvp) => `- [x] ${mvp}`).join("\n")}

## Future Scope
${specDoc.future_scope.map((f) => `- [ ] ${f}`).join("\n")}
`;

    navigator.clipboard.writeText(prdMarkdown);
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 2000);
  };

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
              <FileCode2 className="h-3.5 w-3.5" />
              Product Intelligence & Requirements Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Product Requirements Document (PRD)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Complete product specification with Personas, FRs, NFRs, anti-bloat filters, edge cases, and MVP boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {specDoc && (
              <button
                type="button"
                onClick={handleCopyPrd}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {copiedPrd ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copied PRD!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Export PRD
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleGenerateSpec}
              disabled={generating}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Synthesizing PRD...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {specDoc ? "Re-Generate PRD" : "Generate PRD"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!specDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FileCode2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            PRD Not Formulated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI PM Agent and generate personas, FRs, NFRs, acceptance criteria, and anti-bloat filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Problem Statement & User Segments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  >
                    • {usr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* User Personas */}
          {specDoc.personas && specDoc.personas.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Target User Personas
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {specDoc.personas.map((persona, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {persona.name}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Tech Ability: {persona.technicalAbility}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Goal:</span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">{persona.goal}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Pain:</span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">{persona.pain}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Primary Task:</span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">{persona.primaryTask}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Functional Requirements (FR-xxx) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Functional Requirements (FR)
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {(specDoc.structured_functional_reqs || []).map((fr, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {fr.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {fr.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-0.5">
                      {fr.description}
                    </p>
                  </div>

                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold self-start sm:self-center ${
                    fr.priority === "CRITICAL"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    {fr.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Functional Requirements (NFR-xxx) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Non-Functional Requirements (NFR)
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {(specDoc.structured_non_functional_reqs || []).map((nfr, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        {nfr.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {nfr.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-0.5">
                      {nfr.description}
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300 self-start sm:self-center">
                    {nfr.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Edge Cases Engine */}
          {specDoc.edge_cases && specDoc.edge_cases.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 shadow-sm dark:border-amber-950/50 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-amber-100 pb-3 dark:border-amber-950">
                <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  Critical Edge Cases & Failure Traps
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {specDoc.edge_cases.map((ec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Stories Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <ListTodo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {story.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic">
                    &quot;As a <span className="font-semibold text-slate-900 dark:text-white">{story.asA}</span>, I want to <span className="font-semibold text-slate-900 dark:text-white">{story.iWantTo}</span> so that <span className="font-semibold text-slate-900 dark:text-white">{story.soThat}</span>.&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* MVP Scope vs Future Scope */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  MVP Launch Scope
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {specDoc.mvp_scope.map((mvp, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
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
