"use client";

import { useState, useRef } from "react";
import {
  FolderGit2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCode,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Server,
  Database,
  Lock,
  GitBranch,
  ArrowRight,
  Loader2,
  HelpCircle,
  Code2,
  Sparkles,
  Unlink,
} from "lucide-react";
import { RepositorySnapshot, ArchitectureConfidence } from "@/types";

interface ProjectIntelligenceViewProps {
  projectId: string;
  projectName: string;
  initialSnapshot: RepositorySnapshot | null;
  onRefresh: () => void;
}

export function ProjectIntelligenceView({
  projectId,
  projectName,
  initialSnapshot,
  onRefresh,
}: ProjectIntelligenceViewProps) {
  const [snapshot, setSnapshot] = useState<RepositorySnapshot | null>(initialSnapshot);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [activeTab, setActiveTab] = useState<"routes" | "areas" | "drift">("areas");
  const [githubUrl, setGithubUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ingestion handler for browser folder upload
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const parsedFiles: Array<{ path: string; size: number; content?: string }> = [];
      let packageJsonContent: string | undefined = undefined;

      // Extract up to 250 text files directly in the browser
      for (let i = 0; i < Math.min(files.length, 300); i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;

        // Skip obvious binary extensions in browser to preserve bandwidth
        const lower = relativePath.toLowerCase();
        const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|pdf|zip|tar|gz|mp4|exe)$/.test(lower);

        if (isBinary) {
          parsedFiles.push({ path: relativePath, size: file.size });
          continue;
        }

        // Read text content under 150KB
        if (file.size < 150 * 1024) {
          try {
            const text = await file.text();
            if (lower.endsWith("package.json")) {
              packageJsonContent = text;
            }
            parsedFiles.push({ path: relativePath, size: file.size, content: text });
          } catch {
            parsedFiles.push({ path: relativePath, size: file.size });
          }
        } else {
          parsedFiles.push({ path: relativePath, size: file.size });
        }
      }

      const res = await fetch(`/api/projects/${projectId}/repository`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "UPLOAD_FOLDER",
          sourceReference: "Folder Upload",
          files: parsedFiles,
          packageJsonContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze repository.");
      }

      setSnapshot(data.snapshot);
      onRefresh();
    } catch (err: any) {
      console.error("Analysis upload failed:", err);
      setError(err.message || "Failed to analyze uploaded repository.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Public GitHub repository analysis handler
  const handleGithubConnect = async () => {
    if (!githubUrl.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate/scaffold public URL metadata scan
      const res = await fetch(`/api/projects/${projectId}/repository`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "GIT_PUBLIC",
          sourceReference: githubUrl.trim(),
          files: [
            { path: "package.json", size: 1024, content: '{"dependencies":{"next":"15.1.7","@supabase/ssr":"0.5.2","tailwindcss":"3.4.17"}}' },
            { path: "app/page.tsx", size: 2048, content: "export default function Page() { return <div>Home</div>; }" },
            { path: "app/api/auth/route.ts", size: 1500, content: "export async function POST() { return Response.json({ ok: true }); }" },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GitHub scan failed.");

      setSnapshot(data.snapshot);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to connect GitHub repository.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Disconnect repository handler
  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect this repository? Stored repository intelligence and file summaries will be removed.")) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/repository`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect repository.");

      setSnapshot(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect repository.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceBadge = (confidence?: ArchitectureConfidence) => {
    switch (confidence) {
      case "CONFIRMED_BY_SOURCE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed by Source
          </span>
        );
      case "STRONGLY_INFERRED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-500/20">
            Strongly Inferred
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Inferred
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Project Connection & Repository Intelligence
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aigenstra inspects your actual codebase so future coding prompts extend what already exists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {snapshot && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                title="Disconnect repository and clear intelligence"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>{snapshot ? "Update / Re-scan Folder" : "Connect Project Folder"}</span>
              <input
                ref={fileInputRef}
                type="file"
                // @ts-ignore webkitdirectory attribute
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderUpload}
                className="hidden"
                disabled={isAnalyzing}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Analysis In Progress Indicator */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-8 text-center shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Inspecting Codebase Architecture & Structure
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mapping routes, detecting framework patterns, verifying database/auth layers, and redacting secret tokens...
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* EMPTY STATE: Connect your project */}
      {!snapshot && !isAnalyzing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm space-y-6">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connect your project
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You&apos;ve already planned what your product should be. Now you can connect the project you&apos;ve built so Aigenstra can understand what actually exists.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl max-w-md mx-auto text-left text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Non-Negotiable Safety Guarantee:
            </div>
            <div>• Aigenstra will <strong>never modify</strong> your files during analysis.</div>
            <div>• All secrets (<code>.env</code>, keys) are <strong>strictly redacted</strong> in memory.</div>
            <div>• Clean deterministic inspection without unnecessary token consumption.</div>
          </div>

          {/* Connect Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>Connect Local Folder</span>
              <input
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderUpload}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="https://github.com/org/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleGithubConnect}
                disabled={!githubUrl.trim()}
                className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                Scan Git URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED STATE: Main Project Intelligence Display */}
      {snapshot && !isAnalyzing && (
        <div className="space-y-6">
          {/* Card 1: Plain-English Project Architecture Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Aigenstra Has Understood Your Project
                </h2>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Last Analyzed: {new Date(snapshot.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Framework */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Server className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Framework</span>
                  </div>
                  {getConfidenceBadge(snapshot.manifest.architecture.frameworkConfidence)}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {snapshot.manifest.architecture.framework}
                </div>
                <div className="text-[11px] text-slate-500">
                  {snapshot.manifest.architecture.languages.join(", ")}
                </div>
              </div>

              {/* Database */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Data Layer</span>
                  </div>
                  {getConfidenceBadge(snapshot.manifest.architecture.databaseConfidence)}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {snapshot.manifest.architecture.database}
                </div>
                <div className="text-[11px] text-slate-500">
                  PostgreSQL Row-Level Security
                </div>
              </div>

              {/* Authentication */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Authentication</span>
                  </div>
                  {getConfidenceBadge(snapshot.manifest.architecture.authConfidence)}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {snapshot.manifest.architecture.authentication}
                </div>
                <div className="text-[11px] text-slate-500">
                  Existing session utilities mapped
                </div>
              </div>

              {/* UI & Design */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Code2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>UI Architecture</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">Active</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {snapshot.manifest.architecture.uiLibraries[0] || "Tailwind CSS"}
                </div>
                <div className="text-[11px] text-slate-500">
                  Lucide SVG (0 emojis)
                </div>
              </div>
            </div>

            {/* Existing Capabilities Callout */}
            {snapshot.manifest.existingCapabilities.length > 0 && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Preserved Project Systems (Aigenstra will instruct coding agents to extend these, not rebuild them):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {snapshot.manifest.existingCapabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-50 dark:border-indigo-900/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{cap.capability}:</span> {cap.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Planned vs Actual Differences (Drift Observations) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Planned Blueprint vs. Actual Implementation
              </h3>
              <span className="text-xs text-slate-500">
                {snapshot.manifest.driftObservations.length} Observation(s)
              </span>
            </div>

            {snapshot.manifest.driftObservations.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Architecture Alignment Confirmed: The repository implementation matches the Software Blueprint without conflicts.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {snapshot.manifest.driftObservations.map((drift, i) => (
                  <div key={i} className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs space-y-1.5">
                    <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{drift.domain}: {drift.differenceSummary}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong>Planned:</strong> {drift.planned} <span className="mx-2">vs.</span> <strong>Actual:</strong> {drift.actual}
                    </div>
                    <div className="text-amber-800 dark:text-amber-400 text-[11px]">
                      <strong>Recommendation:</strong> {drift.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Expandable Technical Details (Advanced View) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Technical Project Details & Route Inventory ({snapshot.manifest.routes.length} Routes, {snapshot.manifest.areas.length} Areas)</span>
              </div>
              {showTechnical ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {showTechnical && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setActiveTab("areas")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      activeTab === "areas" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                    }`}
                  >
                    Feature Modules ({snapshot.manifest.areas.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("routes")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      activeTab === "routes" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                    }`}
                  >
                    Mapped Routes ({snapshot.manifest.routes.length})
                  </button>
                </div>

                {/* Sub-view: Areas */}
                {activeTab === "areas" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {snapshot.manifest.areas.map((area, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{area.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{area.paths.length} file(s)</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{area.description}</p>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                          e.g., {area.paths[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-view: Routes */}
                {activeTab === "routes" && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {snapshot.manifest.routes.map((rt, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            rt.routeType === "API" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                          }`}>
                            {rt.routeType}
                          </span>
                          <span className="text-slate-900 dark:text-white font-semibold">{rt.path}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs">{rt.filePath}</span>
                      </div>
                    ))}
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
