"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Palette,
  Sparkles,
  Loader2,
  CheckCircle2,
  Smartphone,
  Eye,
  Layers,
  Layout,
  Maximize2,
} from "lucide-react";
import { DesignSpec } from "@/types";

export default function DesignPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [designDoc, setDesignDoc] = useState<DesignSpec | null>(null);

  useEffect(() => {
    fetchDesign();
  }, [projectId]);

  const fetchDesign = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/design`);
      const data = await res.json();
      if (res.ok && data.designDoc) {
        setDesignDoc(data.designDoc);
      }
    } catch (err) {
      console.error("Failed to load design spec:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDesign = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/design`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.designDoc) {
        setDesignDoc(data.designDoc);
      }
    } catch (err) {
      console.error("Generate design error:", err);
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
              <Palette className="h-3.5 w-3.5" />
              Design System & UX Architecture
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Design & Information Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Sitemap breakdown, responsive layout rules, accessibility (WCAG AA), and component state specs (empty, loading, error, success).
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateDesign}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Design Spec...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {designDoc ? "Re-Generate Design Spec" : "Generate Design Spec"}
              </>
            )}
          </button>
        </div>
      </div>

      {!designDoc ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Palette className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Design Specification Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI UI/UX Agent and generate sitemaps, component states, and responsive accessibility specs.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sitemap & Page List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sitemap & Page Information Architecture
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {designDoc.sitemap.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.page}
                    </span>
                    <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {item.path}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Purpose: {item.purpose}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.actions.map((act, aIdx) => (
                      <span
                        key={aIdx}
                        className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300"
                      >
                        Action: {act}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive & Accessibility Specs */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Responsive Layout Requirements
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {designDoc.responsive_reqs.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Accessibility & Usability Rules
                </h3>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {designDoc.accessibility_reqs.map((aReq, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{aReq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Component State Specifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Component State Specifications
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {designDoc.states.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <span className="uppercase text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                    {st.stateType} State
                  </span>
                  <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                    {st.pageOrComponent}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {st.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
