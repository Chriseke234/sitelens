"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Cpu,
  Sparkles,
  Loader2,
  CheckCircle2,
  Database,
  Server,
  Lock,
  HardDrive,
  Globe,
  Code2,
} from "lucide-react";
import { ArchitectureDoc } from "@/types";

export default function ArchitecturePage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [archDoc, setArchDoc] = useState<ArchitectureDoc | null>(null);

  useEffect(() => {
    fetchArchitecture();
  }, [projectId]);

  const fetchArchitecture = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture`);
      const data = await res.json();
      if (res.ok && data.archDoc) {
        setArchDoc(data.archDoc);
      }
    } catch (err) {
      console.error("Failed to load architecture doc:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArch = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.archDoc) {
        setArchDoc(data.archDoc);
      }
    } catch (err) {
      console.error("Generate architecture error:", err);
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
              <Cpu className="h-3.5 w-3.5" />
              Technical Systems Architecture
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Full-Stack Architecture Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Frontend components, API route boundaries, Database entity-relationships, Auth session flows, and Storage buckets.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateArch}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Architecting System...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {archDoc ? "Re-Generate Architecture" : "Generate Technical Architecture"}
              </>
            )}
          </button>
        </div>
      </div>

      {!archDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Cpu className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Architecture Document Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI Software Architect and formulate frontend, backend, database entity relationships, and API route specs.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Frontend & Backend Breakdown */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Frontend Architecture
                </h3>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div><span className="font-bold text-slate-900 dark:text-white">Framework:</span> {archDoc.frontend.framework}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">Routing:</span> {archDoc.frontend.routing}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">State Management:</span> {archDoc.frontend.stateManagement}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">Error Handling:</span> {archDoc.frontend.errorHandling}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Backend & API Strategy
                </h3>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div><span className="font-bold text-slate-900 dark:text-white">Framework:</span> {archDoc.backend.framework}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">API Routes:</span> {archDoc.backend.apiRoutes}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">Server Actions:</span> {archDoc.backend.serverActions}</div>
                <div><span className="font-bold text-slate-900 dark:text-white">Validation:</span> {archDoc.backend.validation}</div>
              </div>
            </div>
          </div>

          {/* Database Entities & Relationships */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Database Schema & Entity Constraints
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Entities</h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {archDoc.database_schema.entities.map((e, idx) => (
                    <li key={idx}>• {e}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Relationships</h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {archDoc.database_schema.relationships.map((r, idx) => (
                    <li key={idx}>• {r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Constraints & Indexes</h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {archDoc.database_schema.constraints.map((c, idx) => (
                    <li key={idx}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Auth & Storage */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Authentication & Session Security
                </h3>
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div><span className="font-bold">Auth Type:</span> {archDoc.authentication.authType}</div>
                <div><span className="font-bold">Session Handling:</span> {archDoc.authentication.sessionManagement}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <HardDrive className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Storage & Bucket Controls
                </h3>
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div><span className="font-bold">File Storage:</span> {archDoc.storage.fileStorage}</div>
                <div><span className="font-bold">Access Control:</span> {archDoc.storage.accessControl}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
