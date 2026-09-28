"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Wrench,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
} from "lucide-react";

export default function FixQueuePage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [findings, setFindings] = useState<any[]>([]);

  useEffect(() => {
    fetchFindings();
  }, [projectId]);

  const fetchFindings = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`);
      const data = await res.json();
      if (res.ok && data.findings) {
        setFindings(data.findings);
      }
    } catch (err) {
      console.error("Failed to load fix queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixPrompt = async (findingId: string) => {
    setGeneratingId(findingId);
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "generate_fix_prompt",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchFindings();
      }
    } catch (err) {
      console.error("Generate fix prompt error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleUpdateStatus = async (findingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "update_status",
          newStatus,
        }),
      });
      if (res.ok) {
        await fetchFindings();
      }
    } catch (err) {
      console.error("Update status error:", err);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Wrench className="h-3.5 w-3.5" />
            Actionable Findings & Fix Prompt Generator
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Fix Queue & Verification Loop
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Convert identified audit problems into precise, structured Fix Prompts to give your coding AI assistant.
          </p>
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Fix Queue is Empty!
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            No open findings recorded. Run a Multi-Agent Audit to populate actionable fix items.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {findings.map((f) => {
            const fixPrompt = f.fix_prompts?.[0] || f.fix_prompts;
            return (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      [{f.finding_code}]
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {f.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={f.status}
                      onChange={(e) => handleUpdateStatus(f.id, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="partially_resolved">Partially Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleGenerateFixPrompt(f.id)}
                      disabled={generatingId === f.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                    >
                      {generatingId === f.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Generate Fix Prompt
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">Recommendation:</span> {f.recommended_fix}
                </p>

                {/* Generated Fix Prompt Code Editor Block */}
                {fixPrompt && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-blue-400" />
                        <span className="font-mono text-xs font-bold text-slate-300">
                          FIX_PROMPT_{f.finding_code}.md
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(fixPrompt.id, fixPrompt.prompt_text)}
                        className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:bg-blue-500"
                      >
                        {copiedId === fixPrompt.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Fix Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {fixPrompt.prompt_text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
