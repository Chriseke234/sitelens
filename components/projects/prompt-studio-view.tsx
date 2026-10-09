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
    PROJECT_CONTEXT: true,
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
          <span className="inline-flex items-center gap-1 border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 text-xs font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <CheckCircle2 className="h-3 w-3 stroke-[2.5]" /> Ready for Implementation
          </span>
        );
      case "READY_WITH_ASSUMPTIONS":
        return (
          <span className="inline-flex items-center gap-1 border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-xs font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <Info className="h-3 w-3 stroke-[2.5]" /> Ready (Domain Grounded)
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 border-2 border-[#080808] bg-[#FF4F9A] px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-[1.5px_1.5px_0px_#080808]">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" /> Needs User Review
          </span>
        );
      case "NOT_READY":
      default:
        return (
          <span className="inline-flex items-center gap-1 border-2 border-[#080808] bg-white px-2.5 py-0.5 text-xs font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" /> Not Ready
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-mono text-[#080808]">
      {/* Top Banner: Studio Header & Coding Agent Selector */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[11px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]">
                <Terminal className="h-3.5 w-3.5 stroke-[2.5]" />
                STAGE 03 · PROMPT STUDIO
              </div>
              {getStatusBadge(prompt.qualityStatus)}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#080808] sm:text-2xl">
              {prompt.title}
            </h2>
            <p className="text-xs font-medium text-[#080808]/75">
              Compiled 12-section context-aware prompt locked to your real product specifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyMarkdown(false)}
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-0.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Copied Markdown!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 stroke-[2.5]" /> Copy Prompt
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-3.5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] transition-all hover:bg-[#F8F6EC]"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" /> Download .md
            </button>
          </div>
        </div>

        {/* Coding Agent Profile Switcher */}
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#080808]">
            <span>Target Coding Agent Profile</span>
            <span className="font-normal text-[10px] text-[#080808]/70">
              Adapts directives & format rules
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {agentProfiles.map((agent) => {
              const isSelected = prompt.targetAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onSelectAgent(agent.id)}
                  disabled={isCompiling}
                  className={`flex flex-col border-2 border-[#080808] p-3 text-left transition-all ${
                    isSelected
                      ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                      : "bg-[#F8F6EC] text-[#080808] hover:bg-white hover:shadow-[2px_2px_0px_#080808]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase">
                      {agent.name}
                    </span>
                    {agent.isPrimary && (
                      <span className="border border-[#080808] bg-[#B7FF6A] px-1 py-0.2 text-[9px] font-black uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="mt-1 line-clamp-2 text-[10px] font-medium leading-tight text-[#080808]/75">
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
        <div className="flex items-center gap-3 border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#080808] bg-[#FFE500]">
            <Cpu className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#080808]/60">
              Estimated Tokens
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#080808]">
                ~{prompt.optimization.optimizedEstimatedTokens}
              </span>
              {prompt.optimization.reductionPercentage > 0 && (
                <span className="text-[11px] font-black text-[#080808] bg-[#B7FF6A] border border-[#080808] px-1">
                  -{prompt.optimization.reductionPercentage}% optimized
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#080808] bg-[#B7FF6A]">
            <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#080808]/60">
              Readiness Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#080808]">
                {prompt.readinessScore}%
              </span>
              <span className="text-xs font-bold text-[#080808]/70">
                12 sections checked
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#080808] bg-[#FF4F9A] text-white">
            <Zap className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#080808]/60">
              Character Density
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#080808]">
                {prompt.optimization.optimizedCharacterCount} chars
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#080808]/60">
              Agent Handoff Guide
            </div>
            <div className="text-xs font-black uppercase text-[#080808]">
              {prompt.targetAgent} Steps
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHandoffGuide(!showHandoffGuide)}
            className="border-2 border-[#080808] bg-[#F8F6EC] px-2.5 py-1 text-xs font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808] hover:bg-[#FFE500]"
          >
            {showHandoffGuide ? "Hide" : "View"}
          </button>
        </div>
      </div>

      {/* Expandable Handoff Guide Drawer */}
      {showHandoffGuide && (
        <div className="border-[3px] border-[#080808] bg-[#F8F6EC] p-5 shadow-[4px_4px_0px_#080808]">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-[#080808] mt-0.5" />
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#080808]">
                Recommended Handoff Steps for {prompt.targetAgent}
              </div>
              <ol className="list-decimal space-y-1.5 pl-4 text-xs font-bold text-[#080808]/85">
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
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1.5 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
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
        <div className="flex items-center gap-2 border-b-2 border-[#080808] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`border-2 border-[#080808] px-3.5 py-1.5 text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === "sections"
                ? "bg-[#FFE500] text-[#080808] shadow-[2px_2px_0px_#080808]"
                : "bg-white text-[#080808] hover:bg-[#F8F6EC]"
            }`}
          >
            12 Prompt Sections ({prompt.sections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("markdown")}
            className={`border-2 border-[#080808] px-3.5 py-1.5 text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === "markdown"
                ? "bg-[#FFE500] text-[#080808] shadow-[2px_2px_0px_#080808]"
                : "bg-white text-[#080808] hover:bg-[#F8F6EC]"
            }`}
          >
            Full Markdown Code Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("optimization")}
            className={`border-2 border-[#080808] px-3.5 py-1.5 text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === "optimization"
                ? "bg-[#FFE500] text-[#080808] shadow-[2px_2px_0px_#080808]"
                : "bg-white text-[#080808] hover:bg-[#F8F6EC]"
            }`}
          >
            Token Optimization Log
          </button>
        </div>

        {/* Tab 1: 12 Prompt Sections Accordion */}
        {activeTab === "sections" && (
          <div className="space-y-3">
            {prompt.sections.map((sec) => {
              const isOpen = expandedSections[sec.key] !== false;
              return (
                <div
                  key={sec.key}
                  className="border-[3px] border-[#080808] bg-white shadow-[4px_4px_0px_#080808]"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className="flex w-full items-center justify-between border-b-2 border-[#080808] bg-[#F8F6EC] p-3 text-left transition-all hover:bg-white"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black uppercase text-[#080808]">
                        {sec.title}
                      </div>
                      <div className="text-[11px] font-medium text-[#080808]/70">
                        {sec.purpose}
                      </div>
                    </div>
                    <span className="border border-[#080808] bg-white px-2 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                      {isOpen ? "Collapse" : "Expand"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 font-mono text-xs font-medium leading-relaxed text-[#080808] whitespace-pre-wrap bg-white">
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
          <div className="border-[3px] border-[#080808] bg-[#080808] shadow-[6px_6px_0px_#080808]">
            <div className="flex items-center justify-between border-b-2 border-[#080808] bg-[#1a1a1a] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FFE500]">
                  {prompt.targetAgent.toUpperCase()}_PROMPT.md
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyMarkdown(false)}
                className="flex items-center gap-1.5 border border-[#FFE500] bg-[#FFE500] px-3 py-1 text-xs font-black uppercase text-[#080808] hover:bg-white"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="max-h-[550px] overflow-auto p-4 font-mono text-xs text-green-400 whitespace-pre-wrap">
              {prompt.markdownText}
            </pre>
          </div>
        )}

        {/* Tab 3: Token Optimization Log */}
        {activeTab === "optimization" && (
          <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-4">
            <h3 className="text-sm font-black uppercase text-[#080808]">
              Token Optimization Report
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <div className="text-[10px] font-black uppercase text-[#080808]/60">Raw Characters</div>
                <div className="text-lg font-black text-[#080808]">{prompt.optimization.rawCharacterCount}</div>
              </div>
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <div className="text-[10px] font-black uppercase text-[#080808]/60">Optimized Tokens</div>
                <div className="text-lg font-black text-[#080808]">{prompt.optimization.optimizedEstimatedTokens}</div>
              </div>
            </div>

            <div className="border-2 border-[#080808] bg-[#B7FF6A]/20 p-3 text-xs font-bold text-[#080808]">
              <span className="font-black uppercase block mb-1">Deduplication Summary</span>
              <span>Prompt sections have been optimized to avoid repeating project constraints and system boundaries.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
