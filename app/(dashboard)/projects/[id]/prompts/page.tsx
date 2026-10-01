"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Terminal,
  Sparkles,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  ChevronRight,
  Split,
  Bot,
  ListTodo,
  ExternalLink,
} from "lucide-react";
import { PromptCategory, CodingAgentProfile, BuildSessionStatus } from "@/types";

export default function PromptsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>("backend");
  const [selectedAgent, setSelectedAgent] = useState<CodingAgentProfile>("Antigravity");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [buildSessions, setBuildSessions] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [activePrompt, setActivePrompt] = useState<any | null>(null);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [compareVersionNum, setCompareVersionNum] = useState<number | null>(null);
  const [sessionUpdating, setSessionUpdating] = useState(false);

  const categories: Array<{ value: PromptCategory; label: string }> = [
    { value: "product", label: "Product PRD & Scope" },
    { value: "ux", label: "UX & Journey Flow" },
    { value: "ui", label: "UI & Design System" },
    { value: "frontend", label: "Frontend State & Views" },
    { value: "backend", label: "Backend Server Actions" },
    { value: "database", label: "Database Schema & RLS" },
    { value: "api", label: "API Handlers & Authz" },
    { value: "authentication", label: "Auth & Session Tokens" },
    { value: "security", label: "Zero-Trust Security & Zod" },
    { value: "testing", label: "Testing & Verification" },
    { value: "deployment", label: "Deployment & Environment" },
    { value: "audit", label: "Audit & Code Review" },
    { value: "fix", label: "Fix & Refactor Loop" },
  ];

  const agentProfiles: Array<{ id: CodingAgentProfile; label: string; desc: string }> = [
    { id: "Antigravity", label: "Antigravity", desc: "Clean architecture, RLS, responsive & SVG icons" },
    { id: "Cursor", label: "Cursor", desc: "Next.js App Router context with preserved structure" },
    { id: "Claude Code", label: "Claude Code", desc: "High-autonomy codebase inspection & execution" },
    { id: "Codex", label: "Codex", desc: "Algorithmic & functional precision" },
    { id: "Replit", label: "Replit", desc: "Component configuration & environment safety" },
    { id: "Generic", label: "Generic LLM", desc: "Platform-agnostic 16-part implementation prompt" },
  ];

  useEffect(() => {
    fetchPromptsData();
  }, [projectId]);

  const fetchPromptsData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/prompts`);
      const data = await res.json();
      if (res.ok) {
        if (data.prompts) {
          setPrompts(data.prompts);
          if (data.prompts.length > 0) {
            setActivePrompt(data.prompts[0]);
            setSelectedVersionNum(data.prompts[0].current_version || 1);
          }
        }
        if (data.buildSessions) {
          setBuildSessions(data.buildSessions);
        }
        if (data.readiness) {
          setReadiness(data.readiness);
        }
      }
    } catch (err) {
      console.error("Failed to load prompts data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async (cat: PromptCategory) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, codingAgent: selectedAgent }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchPromptsData();
        if (data.prompt) {
          setActivePrompt(data.prompt);
          setSelectedVersionNum(data.prompt.current_version || 1);
        }
      }
    } catch (err) {
      console.error("Generate prompt error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: BuildSessionStatus) => {
    setSessionUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/prompts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status: newStatus }),
      });
      if (res.ok) {
        await fetchPromptsData();
      }
    } catch (err) {
      console.error("Failed to update session status:", err);
    } finally {
      setSessionUpdating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeVersions = activePrompt?.prompt_versions || [];
  const currentVersion = activeVersions.find((v: any) => v.version === selectedVersionNum) || activeVersions[0];
  const compareVersion = compareVersionNum ? activeVersions.find((v: any) => v.version === compareVersionNum) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Terminal className="h-3.5 w-3.5" />
              Prompt Studio & Implementation Engine
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              16-Part Implementation Prompt Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Turn project intelligence into production-grade prompts formatted specifically for your AI coding agent.
            </p>
          </div>
        </div>

        {/* Coding Agent Profile Selector */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Target Coding Agent Profile:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {agentProfiles.map((agent) => {
              const isSelected = selectedAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`flex flex-col rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/60 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                    {agent.label}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate mt-0.5">
                    {agent.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pre-Prompt Readiness Checklist Alert */}
      {readiness && !readiness.isReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-950/60 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Implementation Readiness Notice ({readiness.score}%)
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {readiness.guidanceMessage}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 pt-1">
                {readiness.checks.map((chk: any, idx: number) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      chk.passed
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-200/80 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                    }`}
                  >
                    {chk.passed ? <Check className="h-2.5 w-2.5" /> : "!"}
                    {chk.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Category Generator Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Select Stage:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PromptCategory)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => handleGeneratePrompt(selectedCategory)}
          disabled={generating}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Formulating Prompt...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate {selectedAgent} Prompt
            </>
          )}
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Terminal className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Prompts Generated in Studio Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Pick a stage category and coding agent above to generate your first 16-part implementation prompt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Prompt Stage Selector */}
          <div className="space-y-2 lg:col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Studio Prompts ({prompts.length})
            </div>
            {prompts.map((p) => {
              const isActive = activePrompt?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePrompt(p);
                    setSelectedVersionNum(p.current_version || 1);
                    setCompareVersionNum(null);
                  }}
                  className={`flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="uppercase text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                      {p.category}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      v{p.current_version}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </span>
                </button>
              );
            })}

            {/* Build Sessions Tracker Box */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-3">
                <ListTodo className="h-4 w-4 text-indigo-600" />
                Build Sessions ({buildSessions.length})
              </div>

              {buildSessions.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">
                  Generate prompts to initialize active build sessions.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {buildSessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {session.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-500">{session.coding_agent}</span>
                        <select
                          value={session.status}
                          disabled={sessionUpdating}
                          onChange={(e) => handleUpdateSessionStatus(session.id, e.target.value as BuildSessionStatus)}
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="implemented">Implemented</option>
                          <option value="needs_review">Needs Review</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Code-Editor Window */}
          <div className="lg:col-span-3">
            {activePrompt && (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                {/* Editor Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {activePrompt.category.toUpperCase()}_PROMPT.md
                    </span>
                  </div>

                  {/* Version Picker & Compare Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <History className="h-3.5 w-3.5" />
                      <span>Version:</span>
                      <select
                        value={selectedVersionNum}
                        onChange={(e) => setSelectedVersionNum(Number(e.target.value))}
                        className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-white focus:outline-none"
                      >
                        {activeVersions.map((v: any) => (
                          <option key={v.version} value={v.version}>
                            v{v.version}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeVersions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCompareVersionNum(compareVersionNum ? null : (selectedVersionNum === 1 ? 2 : 1))}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${
                          compareVersionNum ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <Split className="h-3 w-3" />
                        {compareVersionNum ? "Close Diff" : "Compare"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(activePrompt.id, currentVersion?.full_prompt_text || "")}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-500"
                    >
                      {copiedId === activePrompt.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy to {selectedAgent}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Editor Body or Compare View */}
                {compareVersion ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 max-h-[600px] overflow-y-auto font-mono text-xs">
                    <div className="p-4 bg-slate-950/60">
                      <div className="text-[11px] font-bold text-slate-400 mb-2">Version v{selectedVersionNum} (Active)</div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                        {currentVersion?.full_prompt_text}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/30">
                      <div className="text-[11px] font-bold text-amber-400 mb-2">Version v{compareVersion.version} (Comparison)</div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-400">
                        {compareVersion.full_prompt_text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                    {currentVersion?.full_prompt_text || "Formulating prompt..."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
