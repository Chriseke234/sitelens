"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Loader2,
  CheckCircle2,
  Bot,
  MessageSquare,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  XCircle,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AgentDiscussion, AgentDecision, AgentMessageType } from "@/types";

export default function CouncilPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [discussions, setDiscussions] = useState<AgentDiscussion[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [activeTab, setActiveTab] = useState<"debates" | "adrs">("debates");

  useEffect(() => {
    fetchCouncilData();
  }, [projectId]);

  const fetchCouncilData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/council`);
      const data = await res.json();
      if (res.ok) {
        if (data.discussions) setDiscussions(data.discussions);
        if (data.decisions) setDecisions(data.decisions);
      }
    } catch (err) {
      console.error("Failed to load agent discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCouncil = async (topicToDebate?: string) => {
    const topic = topicToDebate || customTopic.trim() || "Guest checkout authentication & data ownership security model";
    setRunning(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/council`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.discussion) {
          setDiscussions((prev) => [data.discussion, ...prev]);
        }
        if (data.decision) {
          setDecisions((prev) => [data.decision, ...prev]);
        }
        setCustomTopic("");
      }
    } catch (err) {
      console.error("Run council error:", err);
    } finally {
      setRunning(false);
    }
  };

  const councilAgents = [
    { name: "Orchestrator Agent", role: "Decision Arbiter", color: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
    { name: "Product Agent", role: "Scope & Value", color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
    { name: "UX Agent", role: "Friction & Flows", color: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
    { name: "Design Agent", role: "Design Systems", color: "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300" },
    { name: "Implementation Advisor", role: "Code Constraints", color: "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300" },
    { name: "Security Agent", role: "Authz & Zero-Trust", color: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
    { name: "QA Agent", role: "Edge Cases & Validation", color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  ];

  const presetTopics = [
    "Guest checkout vs Mandatory account creation prior to order submission",
    "Server Actions with optimistic UI vs REST API endpoints with polling",
    "Soft-delete vs Hard-delete data retention model for user-generated entities",
    "IndexedDB client draft caching vs Continuous backend auto-save",
  ];

  const getMessageTypeBadge = (type?: AgentMessageType) => {
    switch (type) {
      case "ANALYSIS":
        return <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"><Layers className="h-2.5 w-2.5" /> ANALYSIS</span>;
      case "QUESTION":
        return <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300"><HelpCircle className="h-2.5 w-2.5" /> QUESTION</span>;
      case "CONCERN":
        return <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300"><AlertTriangle className="h-2.5 w-2.5" /> CONCERN</span>;
      case "PROPOSAL":
        return <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300"><Lightbulb className="h-2.5 w-2.5" /> PROPOSAL</span>;
      case "DISAGREEMENT":
        return <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950 dark:text-red-300"><XCircle className="h-2.5 w-2.5" /> DISAGREEMENT</span>;
      case "AGREEMENT":
        return <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="h-2.5 w-2.5" /> AGREEMENT</span>;
      case "DECISION":
        return <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"><Sparkles className="h-2.5 w-2.5" /> DECISION</span>;
      default:
        return null;
    }
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
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Users className="h-3.5 w-3.5" />
            7-Agent Multi-Agent Council
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            AI Multi-Agent Council & ADR Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Specialized agents debate technical, product, UX, and security trade-offs to produce formal Architecture Decision Records (ADRs).
          </p>
        </div>

        {/* 7 Agent Roster */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Active Council Roster
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {councilAgents.map((agent) => (
              <div
                key={agent.name}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs ${agent.color}`}
              >
                <Bot className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold truncate">{agent.name}</div>
                  <div className="text-[10px] opacity-75 truncate">{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Propose Debate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Propose Architecture & Product Debate
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Type an architectural dilemma or pick a quick starter to observe the 7 agents debate.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Session cookies vs JWT in Authorization header for third-party integrations"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunCouncil()}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleRunCouncil()}
            disabled={running}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Council Debating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Convene Council
              </>
            )}
          </button>
        </div>

        {/* Preset Starter Topics */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Preset Debate Topics:
          </div>
          <div className="flex flex-wrap gap-2">
            {presetTopics.map((pt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRunCouncil(pt)}
                disabled={running}
                className="text-left rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
              >
                {pt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Debates vs Decisions/ADRs) */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("debates")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "debates"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Debates & Transcripts ({discussions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("adrs")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "adrs"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Architecture Decision Records (ADRs) ({decisions.length})
        </button>
      </div>

      {/* Tab 1: Debates Stack */}
      {activeTab === "debates" && (
        <div className="space-y-6">
          {discussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <MessageSquare className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No Council Debates Yet
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                Pick a topic or propose one above to run a multi-agent debate session.
              </p>
            </div>
          ) : (
            discussions.map((disc) => (
              <div
                key={disc.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Topic: {disc.topic}
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {disc.status.toUpperCase()}
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="mt-4 space-y-3">
                  {disc.agent_messages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs shadow-sm">
                        {msg.agentName.charAt(0)}
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {msg.agentName}
                          </span>
                          {getMessageTypeBadge(msg.messageType)}
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: ADR Log */}
      {activeTab === "adrs" && (
        <div className="space-y-6">
          {decisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No Architecture Decisions Recorded Yet
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                Run a debate to synthesize formal ADRs with alternatives, trade-offs, and consequences.
              </p>
            </div>
          ) : (
            decisions.map((dec) => (
              <div
                key={dec.id}
                className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-6 shadow-sm dark:border-indigo-950 dark:bg-slate-900/90"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-black text-white">
                      ADR-{String(dec.decision_number).padStart(3, "0")}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {dec.topic}
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {dec.status || "ACCEPTED"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Context / Problem</div>
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{dec.problem}</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Decision</div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-semibold leading-relaxed">{dec.decision}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Rationale</div>
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{dec.reason}</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Impacted Systems</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {dec.impacted_areas?.map((area, aIdx) => (
                          <span
                            key={aIdx}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {dec.alternatives_considered && dec.alternatives_considered.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                    <div className="font-bold text-slate-900 dark:text-white mb-1.5">Alternatives Evaluated:</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                      {dec.alternatives_considered.map((alt, aIdx) => (
                        <li key={aIdx}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
