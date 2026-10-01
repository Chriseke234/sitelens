"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SearchCheck,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  Globe,
  Upload,
  ArrowRight,
  ShieldAlert,
  Bot,
  Lock,
} from "lucide-react";
import { AuditFinding } from "@/types";

export default function AuditPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [intakeTab, setIntakeTab] = useState<"repo" | "files" | "url">("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [audits, setAudits] = useState<any[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);

  useEffect(() => {
    fetchAuditData();
  }, [projectId]);

  const fetchAuditData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/audit`);
      const data = await res.json();
      if (res.ok) {
        if (data.audits) setAudits(data.audits);
        if (data.findings) setFindings(data.findings);
      }
    } catch (err) {
      console.error("Failed to load audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const contextData = intakeTab === "repo" ? repoUrl : intakeTab === "url" ? deployedUrl : codeSnippet;
      const res = await fetch(`/api/projects/${projectId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeContext: contextData }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAuditData();
      }
    } catch (err) {
      console.error("Run project audit error:", err);
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const latestAudit = audits[0];
  const criticalCount = findings.filter((f) => f.severity === "critical" && f.lifecycle_status !== "resolved").length;
  const highCount = findings.filter((f) => f.severity === "high" && f.lifecycle_status !== "resolved").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <SearchCheck className="h-3.5 w-3.5" />
              9-Agent Multi-Agent Audit Hub
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Project Audit & Codebase Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Independent audit orchestrated across 9 specialized engineering agents. Treat code as untrusted data.
            </p>
          </div>
        </div>

        {/* Security Boundary Notice */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <Lock className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Security Boundary Enforced:</span> All provided repository files, configuration scripts, and URLs are treated as untrusted project data. Detected API keys, database credentials, and secrets are automatically redacted before analysis.
          </div>
        </div>
      </div>

      {/* Project Intake Connection Hub */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Project Intake & Source Context
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Provide your built project via Git Repository, Code snippet, or Deployed URL to run the 9-agent audit.
        </p>

        {/* Intake Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setIntakeTab("repo")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              intakeTab === "repo"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Git Repository
          </button>
          <button
            type="button"
            onClick={() => setIntakeTab("files")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              intakeTab === "files"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Source Files / Paste
          </button>
          <button
            type="button"
            onClick={() => setIntakeTab("url")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              intakeTab === "url"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Deployed URL
          </button>
        </div>

        {/* Intake Content */}
        <div className="mt-4 space-y-3">
          {intakeTab === "repo" && (
            <div>
              <label htmlFor="repoUrl" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                GitHub / GitLab Repository URL (Read-Only)
              </label>
              <input
                id="repoUrl"
                type="text"
                placeholder="https://github.com/organization/project-repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}

          {intakeTab === "files" && (
            <div>
              <label htmlFor="codeSnippet" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paste Project Code Snippet or Key Route Handlers
              </label>
              <textarea
                id="codeSnippet"
                rows={4}
                placeholder="e.g. Paste route.ts or schema.sql to audit specific components..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}

          {intakeTab === "url" && (
            <div>
              <label htmlFor="deployedUrl" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deployed Production / Staging URL
              </label>
              <input
                id="deployedUrl"
                type="text"
                placeholder="https://my-app.vercel.app"
                value={deployedUrl}
                onChange={(e) => setDeployedUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={auditing}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {auditing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  9 Agents Auditing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {latestAudit ? "Run 9-Agent Re-Audit" : "Run 9-Agent Project Audit"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!latestAudit ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SearchCheck className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Project Audits Executed Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click &quot;Run 9-Agent Project Audit&quot; above to evaluate your application across Product, UX, Frontend, Backend, Security, QA, Performance, and SEO.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 9 Category Readiness Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  9-Domain Readiness Scorecards
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluated on {new Date(latestAudit.created_at).toLocaleDateString()} by specialized auditors
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {criticalCount} Critical
                </span>
                <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {highCount} High
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(latestAudit.readiness_scores || {}).map(([key, score]: [string, any]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="capitalize text-xs font-bold text-slate-500 truncate">
                    {key.replace("_", " ")}
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {score}%
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Findings Preview with Link to Fix Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Identified Findings & Fix Traps ({findings.length})
                </h3>
              </div>
              <Link
                href={`/projects/${projectId}/fix-queue`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Manage in Fix Queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {findings.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                        [{f.finding_code}]
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {f.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {f.simple_explanation}
                    </p>
                  </div>

                  <Link
                    href={`/projects/${projectId}/fix-queue`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all self-start sm:self-center"
                  >
                    Generate Fix Prompt
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
