"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckSquare,
  Loader2,
  CheckCircle2,
  FileCode2,
  Palette,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
} from "lucide-react";
import { ProductionChecklistItem } from "@/types";

export default function ReadinessPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<ProductionChecklistItem[]>([]);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklist();
  }, [projectId]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/readiness`);
      const data = await res.json();
      if (res.ok && data.checklist) {
        setChecklist(data.checklist);
      }
    } catch (err) {
      console.error("Failed to load readiness checklist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemKey: string, currentVal: boolean) => {
    setTogglingKey(itemKey);
    try {
      const res = await fetch(`/api/projects/${projectId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey, isChecked: !currentVal }),
      });
      if (res.ok) {
        setChecklist((prev) =>
          prev.map((item) => (item.item_key === itemKey ? { ...item, is_checked: !currentVal } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const domains: Array<{ key: "product" | "ux" | "engineering" | "security" | "performance" | "seo"; title: string; icon: any; color: string }> = [
    { key: "product", title: "Product & Scope", icon: FileCode2, color: "text-blue-600 dark:text-blue-400" },
    { key: "ux", title: "UX & State Handling", icon: Palette, color: "text-purple-600 dark:text-purple-400" },
    { key: "engineering", title: "Engineering & Architecture", icon: Cpu, color: "text-cyan-600 dark:text-cyan-400" },
    { key: "security", title: "Security & Zero-Trust", icon: ShieldCheck, color: "text-rose-600 dark:text-rose-400" },
    { key: "performance", title: "Performance & Database", icon: Zap, color: "text-amber-600 dark:text-amber-400" },
    { key: "seo", title: "SEO & Semantic Metadata", icon: Globe, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const totalItems = checklist.length || 24;
  const checkedItems = checklist.filter((i) => i.is_checked).length;
  const pct = Math.round((checkedItems / totalItems) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CheckSquare className="h-3.5 w-3.5" />
              Production Launch Checklist
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Production Readiness Checklist
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Verify all 24 critical requirements across 6 domains before deploying your vibe-coded application to production.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Readiness Score
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {pct}%
            </div>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6 Domain Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => {
          const Icon = domain.icon;
          const items = checklist.filter((i) => i.category === domain.key);
          const domainCompleted = items.filter((i) => i.is_checked).length;

          return (
            <div
              key={domain.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${domain.color}`} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {domain.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {domainCompleted}/{items.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <label
                      key={item.item_key}
                      className="flex items-start gap-2.5 cursor-pointer text-xs group"
                    >
                      <input
                        type="checkbox"
                        checked={item.is_checked}
                        disabled={togglingKey === item.item_key}
                        onChange={() => handleToggle(item.item_key, item.is_checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 cursor-pointer"
                      />
                      <span
                        className={`leading-relaxed transition-colors ${
                          item.is_checked
                            ? "line-through text-slate-400 dark:text-slate-600"
                            : "text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        }`}
                      >
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Domain Status</span>
                <span className={domainCompleted === items.length && items.length > 0 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                  {domainCompleted === items.length && items.length > 0 ? "READY" : "IN PROGRESS"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
