"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Lock,
  Layers,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Download,
  Check,
  Terminal,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ProjectUsageMetrics } from "@/lib/analytics/usage";

interface ReadinessDashboardViewProps {
  projectId: string;
  projectName: string;
  initialUsage?: ProjectUsageMetrics;
}

interface ChecklistItem {
  id: string;
  category: string;
  item_key: string;
  title: string;
  is_checked: boolean;
  notes?: string;
}

export function ReadinessDashboardView({
  projectId,
  projectName,
  initialUsage,
}: ReadinessDashboardViewProps) {
  const [usage, setUsage] = useState<ProjectUsageMetrics | null>(initialUsage || null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const [usageRes, checklistRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/analytics`),
        fetch(`/api/projects/${projectId}/readiness`),
      ]);

      if (usageRes.ok) {
        const uData = await usageRes.json();
        if (uData.usage) setUsage(uData.usage);
      }

      if (checklistRes.ok) {
        const cData = await checklistRes.json();
        if (cData.checklist) setChecklist(cData.checklist);
      }
    } catch (err) {
      console.error("Failed to load readiness data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleToggleItem = async (item: ChecklistItem) => {
    const nextState = !item.is_checked;
    setTogglingKey(item.item_key);

    // Optimistic UI update
    setChecklist((prev) =>
      prev.map((c) => (c.item_key === item.item_key ? { ...c, is_checked: nextState } : c))
    );

    try {
      await fetch(`/api/projects/${projectId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemKey: item.item_key,
          isChecked: nextState,
        }),
      });
    } catch (err) {
      console.error("Failed to update checklist item:", err);
      // Revert on error
      setChecklist((prev) =>
        prev.map((c) => (c.item_key === item.item_key ? { ...c, is_checked: item.is_checked } : c))
      );
    } finally {
      setTogglingKey(null);
    }
  };

  const categories = ["ALL", "product", "ux", "engineering", "security", "performance", "seo"];

  const filteredItems = checklist.filter((item) =>
    selectedCategory === "ALL" ? true : item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const checkedCount = checklist.filter((c) => c.is_checked).length;
  const totalCount = checklist.length;
  const readinessPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleExportState = () => {
    const exportData = {
      project: projectName,
      projectId,
      timestamp: new Date().toISOString(),
      readinessPct,
      verifiedCount: `${checkedCount}/${totalCount}`,
      checklist: checklist.map((c) => ({
        category: c.category,
        title: c.title,
        verified: c.is_checked,
      })),
      usage: usage || null,
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <Loader2 className="h-8 w-8 animate-spin text-[#080808]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Header Banner & Progress Indicator */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                FACTUAL VERIFICATION
              </span>
              <span className="border-2 border-[#080808] bg-white px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                {checkedCount} OF {totalCount} CHECKS VERIFIED
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
              Production Release Checklist
            </h1>
            <p className="text-xs font-medium text-[#080808]/80 max-w-2xl">
              Verify your application against real production readiness requirements. Every item is persisted directly to your Supabase project database.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportState}
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#F8F6EC] px-3.5 py-2 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-white active:translate-y-0.5"
            >
              {copiedExport ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3] text-[#080808]" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Export State</span>
                </>
              )}
            </button>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 border-[2.5px] border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] active:translate-y-0.5"
            >
              <RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808] mb-2">
            <span>Overall Verification Progress</span>
            <span className="border-2 border-[#080808] bg-white px-2 py-0.5 shadow-[2px_2px_0px_#080808]">
              {readinessPct}% COMPLETE
            </span>
          </div>
          <div className="h-4 w-full border-2 border-[#080808] bg-white p-0.5 shadow-[2px_2px_0px_#080808]">
            <div
              className="h-full bg-[#080808] transition-all duration-300"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Context & Token Accounting (Factual Only) */}
      <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808]">
        <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 stroke-[2.5] text-[#080808]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#080808]">
              Agent Prompt & Token Accounting
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase text-[#080808]/60">
            Factual Database Metrics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-center shadow-[2px_2px_0px_#080808]">
            <div className="text-[10px] font-black uppercase text-[#080808]/60">Prompts Compiled</div>
            <div className="text-2xl font-black text-[#080808] mt-1">
              {usage?.promptsGenerated || 0}
            </div>
            <div className="text-[10px] font-bold text-[#080808]/70 mt-0.5">Stored in project</div>
          </div>

          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-center shadow-[2px_2px_0px_#080808]">
            <div className="text-[10px] font-black uppercase text-[#080808]/60">Measured Tokens Saved</div>
            <div className="text-2xl font-black text-[#080808] mt-1">
              {usage?.savedTokens && usage.promptsGenerated > 0 ? `~${usage.savedTokens.toLocaleString()}` : "0"}
            </div>
            <div className="text-[10px] font-bold text-[#080808]/70 mt-0.5">
              {usage?.reductionPercentage && usage.promptsGenerated > 0 ? `${usage.reductionPercentage}% Reduction` : "No prompts yet"}
            </div>
          </div>

          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-center shadow-[2px_2px_0px_#080808]">
            <div className="text-[10px] font-black uppercase text-[#080808]/60">Avg Prompt Tokens</div>
            <div className="text-2xl font-black text-[#080808] mt-1">
              {usage?.averagePromptTokens && usage.promptsGenerated > 0 ? `~${usage.averagePromptTokens.toLocaleString()}` : "0"}
            </div>
            <div className="text-[10px] font-bold text-[#080808]/70 mt-0.5">Per generation</div>
          </div>

          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-center shadow-[2px_2px_0px_#080808]">
            <div className="text-[10px] font-black uppercase text-[#080808]/60">Verified Fixes</div>
            <div className="text-2xl font-black text-[#080808] mt-1">
              {usage?.fixesVerified || 0}
            </div>
            <div className="text-[10px] font-bold text-[#080808]/70 mt-0.5">Audit fix queue</div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Real Checklist Matrix */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#080808] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 stroke-[2.5] text-[#080808]" />
            <h3 className="text-sm font-black uppercase text-[#080808]">
              Interactive Production Verification Items
            </h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`border border-[#080808] px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#FFE500] text-[#080808] shadow-[1.5px_1.5px_0px_#080808]"
                    : "bg-white text-[#080808]/70 hover:bg-[#F8F6EC]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="border-2 border-dashed border-[#080808] bg-[#F8F6EC] p-8 text-center text-xs">
            <p className="font-black uppercase text-[#080808]">No checklist items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isToggling = togglingKey === item.item_key;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`flex items-start gap-3 border-2 border-[#080808] p-3.5 cursor-pointer transition-all select-none ${
                    item.is_checked
                      ? "bg-[#F8F6EC] shadow-[2px_2px_0px_#080808]"
                      : "bg-white shadow-[3px_3px_0px_#080808] hover:bg-[#F8F6EC]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-[#080808] transition-colors ${
                      item.is_checked ? "bg-[#B7FF6A]" : "bg-white"
                    }`}
                  >
                    {item.is_checked && <Check className="h-3.5 w-3.5 stroke-[3] text-[#080808]" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="border border-[#080808] bg-white px-1.5 py-0.2 text-[9px] font-black uppercase text-[#080808]">
                        {item.category}
                      </span>
                      {item.is_checked ? (
                        <span className="border border-[#080808] bg-[#B7FF6A] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#080808]">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="border border-[#080808] bg-white px-1.5 py-0.2 text-[9px] font-black uppercase text-[#080808]/60">
                          PENDING
                        </span>
                      )}
                    </div>

                    <p className={`text-xs font-bold text-[#080808] leading-tight ${item.is_checked ? "line-through text-[#080808]/60" : ""}`}>
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Action Banner */}
      <div className="border-[3px] border-[#080808] bg-[#FFE500] p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-[#080808]">
              Ready to give instructions to your AI coding agent?
            </h3>
            <p className="text-xs font-medium text-[#080808]/85">
              Copy context-packed prompts directly into Google Antigravity, Cursor, or Claude Code.
            </p>
          </div>

          <Link
            href={`/projects/${projectId}/prompts`}
            className="inline-flex items-center gap-2 border-[2.5px] border-[#080808] bg-[#080808] px-5 py-2.5 text-xs font-black uppercase text-[#FFE500] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-white hover:text-[#080808] hover:shadow-[3px_3px_0px_#080808] active:translate-y-0.5 shrink-0"
          >
            <span>Open Prompt Studio →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
