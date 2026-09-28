"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Scale,
  Sparkles,
  Loader2,
  CheckCircle2,
  Users,
  Layers,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { AgentDecision } from "@/types";

export default function DecisionsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);

  useEffect(() => {
    fetchDecisions();
  }, [projectId]);

  const fetchDecisions = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/decisions`);
      const data = await res.json();
      if (res.ok && data.decisions) {
        setDecisions(data.decisions);
      }
    } catch (err) {
      console.error("Failed to load decisions:", err);
    } finally {
      setLoading(false);
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
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Scale className="h-3.5 w-3.5" />
            Product Architecture Audit Log
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Project Decision Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Immutable log of consensus decisions, agent positions, alternative trade-offs, and affected systems.
          </p>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Scale className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Decisions Recorded Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Run your AI Agent Council to debate architecture trade-offs. Consensus decisions will automatically log here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xs">
                    #{dec.decision_number}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {dec.topic}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Logged on {new Date(dec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {dec.status}
                </span>
              </div>

              {/* Decision Details Grid */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Problem Addressed</span>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{dec.problem}</p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-950/50 dark:bg-blue-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Agreed Decision</span>
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">{dec.decision}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reasoning & Justification</span>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{dec.reason}</p>
              </div>

              {/* Impacted Systems */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Impacted Systems:</span>
                {dec.impacted_areas.map((area, aIdx) => (
                  <span
                    key={aIdx}
                    className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
