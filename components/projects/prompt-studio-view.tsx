"use client";

import { useState } from "react";
import {
  Terminal,
  Sparkles,
  Copy,
  Check,
  Download,
  Split,
  History,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  Maximize2,
  Minimize2,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  CompiledPrompt,
  CodingAgentProfile,
  PromptQualityStatus,
  PromptSection,
} from "@/types";

interface PromptStudioViewProps {
  prompt: CompiledPrompt;
  onSelectAgent: (agent: CodingAgentProfile) => void;
  onRecompile?: () => void;
  isCompiling?: boolean;
  onUpdateTaskStatus?: (newStatus: "IN_PROGRESS" | "COMPLETED") => void;
}

export function PromptStudioView({
  prompt,
  onSelectAgent,
  onRecompile,
  isCompiling = false,
  onUpdateTaskStatus,
}: PromptStudioViewProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "markdown" | "optimization">("sections");
  const [copied, setCopied] = useState(false);
  const [copiedWithDirectives, setCopiedWithDirectives] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ROLE: true,
    OBJECTIVE: true,
    CHANGE_BOUNDARIES: true,
    REQUIREMENTS: true,
    ACCEPTANCE_CRITERIA: true,
  });
  const [showHandoffGuide, setShowHandoffGuide] = useState(false);

  const agentProfiles: Array<{
    id: CodingAgentProfile;
    name: string;
    tagline: string;
    isPrimary?: boolean;
  }> = [
    {
      id: "Antigravity",
      name: "Google Antigravity",
      tagline: "Codebase exploration, strict boundaries, RLS & clean TypeScript",
      isPrimary: true,
    },
    {
      id: "Claude Code",
      name: "Claude Code",
      tagline: "Autonomous CLI agent with local test execution",
    },
    {
      id: "Cursor",
      name: "Cursor IDE",
      tagline: "App Router context rules & Composer layout",
    },
    {
      id: "Codex",
      name: "Codex / OpenAI",
      tagline: "Algorithmic precision & strict specifications",
    },
    {
      id: "Generic",
      name: "Generic LLM",
      tagline: "Platform-agnostic 12-section architecture specification",
    },
  ];

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyMarkdown = (includeHandoff: boolean = false) => {
    const textToCopy = includeHandoff
      ? `${prompt.markdownText}\n\n<!-- INSTRUCTIONS FOR USER: Paste this prompt directly into ${prompt.targetAgent} -->`
      : prompt.markdownText;

    navigator.clipboard.writeText(textToCopy);
    if (includeHandoff) {
      setCopiedWithDirectives(true);
      setTimeout(() => setCopiedWithDirectives(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([prompt.markdownText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(prompt.taskTitle || "PROMPT").toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PromptQualityStatus) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Ready for Implementation
          </span>
        );
      case "READY_WITH_ASSUMPTIONS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
            <Info className="h-3 w-3" /> Ready (Guided Assumptions)
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" /> Needs User Review
          </span>
        );
      case "NOT_READY":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertTriangle className="h-3 w-3" /> Not Ready
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Studio Header & Coding Agent Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Terminal className="h-3.5 w-3.5" />
                Prompt Compiler & Token Optimizer
              </div>
              {getStatusBadge(prompt.qualityStatus)}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
              {prompt.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Compiled 12-section context-aware coding prompt ready for external agent execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyMarkdown(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied Markdown!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Prompt
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" /> Download .md
            </button>
          </div>
        </div>

        {/* Coding Agent Profile Switcher */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Target Coding Agent Profile</span>
            <span className="font-normal lowercase text-slate-500">
              Adapts prompt structure & directives
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {agentProfiles.map((agent) => {
              const isSelected = prompt.targetAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onSelectAgent(agent.id)}
                  disabled={isCompiling}
                  className={`relative flex flex-col rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {agent.name}
                    </span>
                    {agent.isPrimary && (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-extrabold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                    {agent.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Token Optimization & Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estimated Tokens
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ~{prompt.optimization.optimizedEstimatedTokens}
              </span>
              {prompt.optimization.reductionPercentage > 0 && (
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  -{prompt.optimization.reductionPercentage}% optimized
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Readiness Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {prompt.readinessScore}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                12 sections checked
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Character Density
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {prompt.optimization.optimizedCharacterCount} chars
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Agent Handoff Guide
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              How to run in {prompt.targetAgent}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHandoffGuide(!showHandoffGuide)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {showHandoffGuide ? "Hide Guide" : "View Steps"}
          </button>
        </div>
      </div>

      {/* Expandable Handoff Guide Drawer */}
      {showHandoffGuide && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5 dark:text-indigo-400" />
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Recommended Handoff Steps for {prompt.targetAgent}
              </div>
              <ol className="list-decimal space-y-1.5 pl-4 text-xs text-indigo-950 dark:text-slate-300">
                <li>
                  Click <strong>Copy Prompt</strong> above to place the compiled 12-section markdown on your clipboard.
                </li>
                <li>
                  Open your <strong>{prompt.targetAgent}</strong> coding interface (or terminal).
                </li>
                <li>
                  Paste the prompt directly into the agent input box and press Send.
                </li>
                <li>
                  The coding agent will inspect the workspace, respect the <strong>MUST CHANGE</strong> boundaries, and verify with <code>npm run typecheck</code>.
                </li>
              </ol>

              {onUpdateTaskStatus && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onUpdateTaskStatus("IN_PROGRESS")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Task as In Progress
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main View Tabs (Sections vs Raw Markdown vs Token Optimization) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "sections"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              12 Prompt Sections ({prompt.sections.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("markdown")}
              className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "markdown"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Full Markdown Code Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("optimization")}
              className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "optimization"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Token Optimization Log
            </button>
          </div>
        </div>

        {/* Tab 1: 12 Prompt Sections Accordion */}
        {activeTab === "sections" && (
          <div className="space-y-3">
            {/* Repository Grounding Notice */}
            {prompt.sections.find((s) => s.key === "CURRENT_STATE")?.content.includes("Existing Capabilities") && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prompt grounded in verified repository architecture. Instructs agent to extend existing modules.</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Repo-Aware
                </span>
              </div>
            )}
            {prompt.sections.map((sec, idx) => {
              const isOpen = expandedSections[sec.key] !== false;
              return (
                <div
                  key={sec.key}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className="flex w-full items-center justify-between bg-slate-50/60 p-4 text-left transition-all hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-950"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {sec.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {sec.purpose}
                      </div>
                    </div>
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {isOpen ? "Collapse" : "Expand"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-4 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap dark:border-slate-800 dark:text-slate-300">
                      {sec.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Full Markdown Editor View */}
        {activeTab === "markdown" && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {prompt.targetAgent.toUpperCase()}_PROMPT.md
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyMarkdown(false)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-indigo-500"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 max-h-[600px] overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
              {prompt.markdownText}
            </div>
          </div>
        )}

        {/* Tab 3: Token Optimization Log */}
        {activeTab === "optimization" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Cpu className="h-4 w-4 text-indigo-600" />
              Token Optimization & Deduplication Engine Report
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-slate-400">Raw Input Size</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {prompt.optimization.rawCharacterCount} chars (~{prompt.optimization.rawEstimatedTokens} tokens)
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-slate-400">Optimized Size</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {prompt.optimization.optimizedCharacterCount} chars (~{prompt.optimization.optimizedEstimatedTokens} tokens)
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-slate-400">Token Efficiency Gain</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  -{prompt.optimization.reductionPercentage}% token reduction
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Applied Optimizations & Guardrails
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {prompt.optimization.optimizationsApplied.map((opt, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {prompt.optimization.contradictionsDetected?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-slate-950">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2">
                  Resolved Boundary Contradictions
                </div>
                {prompt.optimization.contradictionsDetected.map((c, i) => (
                  <div key={i} className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>Collision:</strong> {c.ruleA} vs {c.ruleB}
                    <br />
                    <strong>Resolution:</strong> {c.resolution}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
