"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Rocket,
  SearchCheck,
  Code2,
  Terminal,
  Target,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Wrench,
} from "lucide-react";

interface NewProjectWizardProps {
  onSuccess?: (projectId: string) => void;
}

export function NewProjectWizard({ onSuccess }: NewProjectWizardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stage: "idea",
    coding_environment: "Cursor",
    tech_stack: "",
    goal: "",
    mode: "build",
    repo_url: "",
  });

  const stages = [
    { value: "idea", label: "Just an Idea", desc: "Formulating early product concept" },
    { value: "researching", label: "Researching", desc: "Analyzing market, users & alternatives" },
    { value: "planning", label: "Planning", desc: "Defining specifications & user journeys" },
    { value: "designing", label: "Designing", desc: "Structuring UX, wireframes & component flows" },
    { value: "building", label: "Building", desc: "Active vibe-coding & implementation" },
    { value: "almost_finished", label: "Almost Finished", desc: "Polishing & executing pre-launch audits" },
    { value: "launched", label: "Already Launched", desc: "Live product in production" },
  ];

  const environments = [
    { value: "Antigravity", label: "Google Antigravity", icon: Sparkles },
    { value: "Cursor", label: "Cursor IDE", icon: Terminal },
    { value: "Claude Code", label: "Claude Code", icon: Code2 },
    { value: "Replit", label: "Replit Agent", icon: Wrench },
    { value: "Lovable", label: "Lovable", icon: Rocket },
    { value: "v0", label: "v0 by Vercel", icon: Target },
    { value: "Other", label: "Other Coding Environment", icon: Code2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please enter a product description.");
      return;
    }
    if (!formData.goal.trim()) {
      setError("Please describe what success looks like for this project.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project workspace.");
      }

      if (onSuccess) {
        onSuccess(data.project.id);
      } else {
        router.push(`/projects/${data.project.id}/overview`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          Aigenstra Workspace Creator
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
          Create AI Product Engineering Workspace
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Set up your product context, target environment, and goals to assemble your multidisciplinary AI engineering team.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Mode Selector */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            Primary Workspace Focus
          </label>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: "build" })}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                formData.mode === "build"
                  ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <div className="rounded-lg bg-blue-600 p-2.5 text-white">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  MODE A — BUILD
                  {formData.mode === "build" && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Idea → Discovery → User Journey → Architecture → Security → Build Prompts.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: "audit" })}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                formData.mode === "audit"
                  ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <div className="rounded-lg bg-indigo-600 p-2.5 text-white">
                <SearchCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  MODE B — AUDIT
                  {formData.mode === "audit" && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Connect Repo → Architecture & Security Audit → Findings → Fix Prompts → Re-Audit.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Project Name & Goal */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-900 dark:text-white">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. OgaWash, Sitelens, DevPortal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="tech_stack" className="block text-sm font-bold text-slate-900 dark:text-white">
              Technology Preference <span className="text-xs font-normal text-slate-500">(Optional)</span>
            </label>
            <input
              id="tech_stack"
              type="text"
              placeholder="e.g. Next.js, React, Supabase, Tailwind, Python"
              value={formData.tech_stack}
              onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-900 dark:text-white">
            Product Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={3}
            placeholder="Describe what your product does, who it's for, and how it delivers value. e.g. A platform connecting busy workers with local laundry services for scheduled pickups and deliveries."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Project Goal */}
        <div>
          <label htmlFor="goal" className="block text-sm font-bold text-slate-900 dark:text-white">
            Project Goal / Success Definition <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal"
            type="text"
            required
            placeholder="e.g. Build a secure MVP with guest checkout, order tracking, and mobile-friendly UI."
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Project Stage */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            Project Stage
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stages.map((stg) => (
              <button
                key={stg.value}
                type="button"
                onClick={() => setFormData({ ...formData, stage: stg.value })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  formData.stage === stg.value
                    ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">{stg.label}</div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {stg.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coding Environment */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            Target Vibe-Coding Environment
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {environments.map((env) => {
              const IconComp = env.icon;
              return (
                <button
                  key={env.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, coding_environment: env.value })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    formData.coding_environment === env.value
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  }`}
                >
                  <IconComp className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {env.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional GitHub Repo URL for Audit Mode */}
        {formData.mode === "audit" && (
          <div>
            <label htmlFor="repo_url" className="block text-sm font-bold text-slate-900 dark:text-white">
              GitHub Repository or Production URL <span className="text-xs font-normal text-slate-500">(Optional)</span>
            </label>
            <input
              id="repo_url"
              type="url"
              placeholder="https://github.com/username/repository or https://myproject.com"
              value={formData.repo_url}
              onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        )}

        {/* Submit Action */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Workspace...
              </>
            ) : (
              <>
                Launch Aigenstra Workspace
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
