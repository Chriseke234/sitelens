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
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ProductType, CodingEnvironment, ProjectMode } from "@/types";

interface NewProjectWizardProps {
  onSuccess?: (projectId: string) => void;
}

export function NewProjectWizard({ onSuccess }: NewProjectWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_type: "SaaS" as ProductType,
    target_audience: "",
    problem_statement: "",
    raw_idea: "",
    stage: "idea",
    coding_environment: "Cursor" as CodingEnvironment,
    tech_stack: "",
    goal: "",
    mode: "build" as ProjectMode,
    repo_url: "",
  });

  const productTypes: ProductType[] = [
    "SaaS",
    "Marketplace",
    "Web App",
    "Mobile App",
    "Internal Tool",
    "E-commerce",
    "AI Product",
    "API",
    "Landing Page",
    "Other",
  ];

  const environments: Array<{ value: CodingEnvironment; label: string; icon: any }> = [
    { value: "Cursor", label: "Cursor", icon: Terminal },
    { value: "Antigravity", label: "Google Antigravity", icon: Sparkles },
    { value: "Claude Code", label: "Claude Code", icon: Code2 },
    { value: "Replit", label: "Replit", icon: Wrench },
    { value: "Lovable", label: "Lovable", icon: Rocket },
    { value: "v0", label: "v0 by Vercel", icon: Target },
    { value: "Other", label: "Other Environment", icon: Code2 },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please provide a brief project summary.");
      return;
    }
    if (!formData.target_audience.trim()) {
      setError("Please define your target audience.");
      return;
    }
    if (!formData.problem_statement.trim()) {
      setError("Please describe the problem being solved.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.raw_idea.trim()) {
      setError("Please describe what you want to build.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          goal: formData.goal || formData.description,
        }),
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
      {/* Header & Step Indicator */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Aigenstra Product Workspace
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step === 1
                  ? "bg-indigo-600 text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              1
            </span>
            <span>Basics</span>
            <span className="text-slate-300 dark:text-slate-700">──</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step === 2
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              2
            </span>
            <span>Product Idea</span>
          </div>
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
          {step === 1 ? "Step 1 — Project Basics" : "Step 2 — Raw Product Idea"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {step === 1
            ? "Define your project parameters, product type, target audience, and environment."
            : "Describe what you want to build in your own words. Messy input is encouraged."}
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {/* STEP 1: PROJECT BASICS */}
      {step === 1 && (
        <form onSubmit={handleNext} className="mt-6 space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Workspace Mode
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "build" })}
                className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                  formData.mode === "build"
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                <div className="rounded-lg bg-indigo-600 p-2 text-white shrink-0">
                  <Rocket className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                    MODE A — BUILD
                    {formData.mode === "build" && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Idea → Discovery → Journey → Architecture → Security → Build Prompts.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "audit" })}
                className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                  formData.mode === "audit"
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                <div className="rounded-lg bg-slate-800 p-2 text-white shrink-0">
                  <SearchCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                    MODE B — AUDIT
                    {formData.mode === "audit" && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Connect Repo → Architecture & Security Audit → Findings → Fix Prompts.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Project Name & Product Type */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. OgaWash, Aigenstra, DevPortal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="product_type" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Product Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="product_type"
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value as ProductType })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {productTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Audience & Problem Being Solved */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="target_audience" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <input
                id="target_audience"
                type="text"
                required
                placeholder="e.g. Busy urban professionals, indie developers, restaurants"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="problem_statement" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Problem Being Solved <span className="text-rose-500">*</span>
              </label>
              <input
                id="problem_statement"
                type="text"
                required
                placeholder="e.g. Too much friction managing laundry pickups and order tracking"
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Project Summary */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Brief Summary <span className="text-rose-500">*</span>
            </label>
            <input
              id="description"
              type="text"
              required
              placeholder="e.g. A platform connecting busy workers with local laundry services."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Coding Environment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Coding Environment
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {environments.map((env) => {
                const IconComp = env.icon;
                return (
                  <button
                    key={env.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, coding_environment: env.value })}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      formData.coding_environment === env.value
                        ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <IconComp className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {env.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 text-xs sm:text-sm"
            >
              Continue to Product Idea
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: RAW PRODUCT IDEA */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="raw_idea" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Describe What You Want to Build <span className="text-rose-500">*</span>
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Write as much or as little as you want. Feel free to use rough notes, bullet points, or unstructured text.
            </p>
            <textarea
              id="raw_idea"
              required
              rows={8}
              placeholder="e.g. I want to build a platform where restaurants can upload their menu and customers can order through WhatsApp. It should support cash on delivery, kitchen order printing, customer feedback via SMS, and mobile admin stats..."
              value={formData.raw_idea}
              onChange={(e) => setFormData({ ...formData, raw_idea: e.target.value })}
              className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-4 font-mono text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900 dark:border-indigo-950/50 dark:bg-indigo-950/30 dark:text-indigo-200">
            <span className="font-bold">Aigenstra Principle:</span> We store your raw idea first without forcing premature conclusions. Your AI PM & Research Agents will analyze this description in the Discovery Engine.
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Basics
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 text-xs sm:text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Project Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
