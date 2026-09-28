"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  Bot,
  MessageSquare,
  ShieldCheck,
  Scale,
  Send,
} from "lucide-react";
import { AgentDiscussion, AgentDecision } from "@/types";

export default function CouncilPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [discussions, setDiscussions] = useState<AgentDiscussion[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [latestDecision, setLatestDecision] = useState<AgentDecision | null>(null);

  useEffect(() => {
    fetchDiscussions();
  }, [projectId]);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/council`);
      const data = await res.json();
      if (res.ok && data.discussions) {
        setDiscussions(data.discussions);
      }
    } catch (err) {
      console.error("Failed to load agent discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCouncil = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRunning(true);
    setLatestDecision(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/council`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic.trim() || "Guest checkout authentication & data ownership security model",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.discussion) {
          setDiscussions([data.discussion, ...discussions]);
        }
        if (data.decision) {
          setLatestDecision(data.decision);
        }
        setCustomTopic("");
      }
    } catch (err) {
      console.error("Run council error:", err);
    } finally {
      setRunning(false);
    }
  };

  const agentBadges = [
    { name: "Product Manager Agent", role: "Scope & Requirements", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    { name: "Research Agent", role: "Market & User Evidence", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
    { name: "UX Agent", role: "Journeys & Usability", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
    { name: "UI Agent", role: "Interface & Design System", color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
    { name: "Frontend Engineer Agent", role: "Client State & Routing", color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
    { name: "Backend Engineer Agent", role: "APIs & DB Schema", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
    { name: "Security Engineer Agent", role: "Threats & Authz", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
    { name: "QA Agent", role: "Edge Cases & Tests", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
    { name: "Performance Agent", role: "Latency & Bundle", color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" },
    { name: "Auditor Agent", role: "Cross-Review", color: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
    { name: "Orchestrator Agent", role: "Discussion Facilitator", color: "bg-blue-600 text-white" },
  ];

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
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Users className="h-3.5 w-3.5" />
            AI Engineering Agent Council
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Multi-Agent Council & Orchestrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Watch specialized AI agents debate trade-offs (UX vs Security, MVP scope vs scalability) and synthesize consensus decisions.
          </p>
        </div>

        {/* Agent Badge Roster */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 mb-2">Council Members:</div>
          <div className="flex flex-wrap gap-2">
            {agentBadges.map((badge) => (
              <span
                key={badge.name}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.color}`}
              >
                <Bot className="h-3 w-3" />
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trigger New Debate Form */}
      <form onSubmit={handleRunCouncil} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label htmlFor="topic" className="block text-sm font-bold text-slate-900 dark:text-white">
          Propose Architecture Topic for Council Debate
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="topic"
            type="text"
            placeholder="e.g. Guest checkout vs required account registration, CSRF vs HttpOnly cookie auth"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="submit"
            disabled={running}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Agents Debating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Convene Agent Council
              </>
            )}
          </button>
        </div>
      </form>

      {/* Latest Decision Banner */}
      {latestDecision && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm dark:border-emerald-950/60 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Decision #{latestDecision.decision_number} Reached by Orchestrator
          </div>

          <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
            {latestDecision.topic}
          </h3>

          <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
            <div><span className="font-bold text-slate-900 dark:text-white">Decision:</span> {latestDecision.decision}</div>
            <div className="mt-1"><span className="font-bold text-slate-900 dark:text-white">Reasoning:</span> {latestDecision.reason}</div>
            <div className="mt-2 text-blue-600 font-semibold dark:text-blue-400">
              Affected Systems: {latestDecision.impacted_areas.join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Discussions Log Stack */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Agent Discussion Transcripts
        </h3>

        {discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              No Agent Debates Executed Yet
            </h2>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Propose a topic above to convene your AI Council and observe specialized agent debate.
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
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Topic: {disc.topic}
                  </h4>
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
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
                      {msg.agentName.charAt(0)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {msg.agentName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
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
    </div>
  );
}
