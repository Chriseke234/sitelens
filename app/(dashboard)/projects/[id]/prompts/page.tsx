"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Terminal,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Edit3,
  CheckCircle2,
  Code2,
  Play,
  RotateCcw,
  FileCode,
} from "lucide-react";
import { PromptCategory } from "@/types";

export default function PromptsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>("architecture");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [activePrompt, setActivePrompt] = useState<any | null>(null);

  const categories: Array<{ value: PromptCategory; label: string }> = [
    { value: "architecture", label: "Architecture Prompt" },
    { value: "database", label: "Database Prompt" },
    { value: "authentication", label: "Authentication Prompt" },
    { value: "backend", label: "Backend & API Prompt" },
    { value: "frontend", label: "Frontend & UI Prompt" },
    { value: "security", label: "Security & RLS Prompt" },
    { value: "product", label: "Product Spec Prompt" },
    { value: "ux", label: "UX & Journey Prompt" },
    { value: "design", label: "Design System Prompt" },
    { value: "testing", label: "Testing Suite Prompt" },
    { value: "deployment", label: "Deployment Prompt" },
    { value: "audit", label: "Audit Prompt" },
    { value: "fix", label: "Fix Prompt" },
  ];

  useEffect(() => {
    fetchPrompts();
  }, [projectId]);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/prompts`);
      const data = await res.json();
      if (res.ok && data.prompts) {
        setPrompts(data.prompts);
        if (data.prompts.length > 0) {
          setActivePrompt(data.prompts[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load prompts:", err);
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
        body: JSON.stringify({ category: cat }),
      });

      const data = await res.json();
      if (res.ok && data.prompt) {
        await fetchPrompts();
      }
    } catch (err) {
      console.error("Generate prompt error:", err);
    } finally {
      setGenerating(false);
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const latestVersion = activePrompt?.prompt_versions?.[0] || activePrompt?.prompt_versions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Terminal className="h-3.5 w-3.5" />
              11-Part Vibe-Coding Prompt Workspace
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Structured Implementation Prompts
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Copy context-rich implementation prompts directly into Cursor, Antigravity, Claude Code, or Replit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PromptCategory)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleGeneratePrompt(selectedCategory)}
              disabled={generating}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Prompt
            </button>
          </div>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Terminal className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Prompts Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select a category above and click &quot;Generate Prompt&quot; to formulate an 11-part structured coding prompt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Prompt Selector */}
          <div className="space-y-2 lg:col-span-1">
            <div className="text-xs font-bold text-slate-500 mb-2">Saved Prompts ({prompts.length})</div>
            {prompts.map((p) => {
              const isActive = activePrompt?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePrompt(p)}
                  className={`flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? "border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="uppercase text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      v{p.current_version}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Code-Editor Window */}
          <div className="lg:col-span-3">
            {activePrompt && (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                {/* Editor Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {activePrompt.category.toUpperCase()}_IMPLEMENTATION_PROMPT.md
                    </span>
                    <span className="rounded bg-blue-950 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400">
                      v{activePrompt.current_version}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(activePrompt.id, latestVersion?.full_prompt_text || "")}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-500"
                    >
                      {copiedId === activePrompt.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Prompt
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto max-h-[550px] overflow-y-auto whitespace-pre-wrap">
                  {latestVersion?.full_prompt_text || "Prompt text loading..."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
