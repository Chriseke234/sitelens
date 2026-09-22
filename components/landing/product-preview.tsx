import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  AlertCircle,
  TrendingUp,
  Gauge,
  UserCheck,
  Layout,
  ShieldCheck,
  Target,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export function ProductPreview() {
  const categoryScores = [
    { name: "SEO", score: 82, icon: TrendingUp, status: "Good" },
    { name: "Performance", score: 71, icon: Gauge, status: "Good" },
    { name: "Accessibility", score: 76, icon: UserCheck, status: "Good" },
    { name: "UX", score: 69, icon: Layout, status: "Needs Attention" },
    { name: "Trust", score: 73, icon: ShieldCheck, status: "Good" },
    { name: "Conversion", score: 61, icon: Target, status: "Needs Attention" },
  ];

  const priorityIssues = [
    {
      id: 1,
      title: "Primary CTA lacks clarity",
      category: "UX / Conversion",
      severity: "High",
      icon: Target,
    },
    {
      id: 2,
      title: "Missing meta description tag",
      category: "Technical SEO",
      severity: "Medium",
      icon: FileText,
    },
    {
      id: 3,
      title: "Large hero image affecting initial render performance",
      category: "Performance",
      severity: "Medium",
      icon: ImageIcon,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8 animate-float-soft transition-all duration-500 hover:shadow-blue-500/20">
      {/* Visual Window Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400/80" />
            <div className="h-3 w-3 rounded-full bg-amber-400/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-mono font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>https://yourdomain.com</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 rounded-full gap-1.5 px-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Audit Preview</span>
          </Badge>
        </div>
      </div>

      {/* Main Audit Summary Header */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Overall Score Box */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50 card-hover-effect">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overall Health Score
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
                PASSED
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                74
              </span>
              <span className="text-lg font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: "74%" }} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Good overall health with key UX opportunities
              </span>
            </div>
          </div>
        </div>

        {/* 6 Category Scores Grid */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2 sm:grid-cols-3">
          {categoryScores.map((cat, idx) => {
            const Icon = cat.icon;
            const isAttention = cat.score < 70;
            return (
              <div
                key={cat.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 hover:scale-[1.03] hover:border-blue-400/60 hover:shadow-md cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {cat.name}
                  </span>
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {cat.score}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isAttention
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {cat.score}/100
                    </span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${
                        isAttention ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Issues Section */}
      <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-5">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Priority Issues (Sample Report)
            </h4>
          </div>
          <span className="text-xs font-medium text-slate-400">3 critical findings</span>
        </div>

        <div className="space-y-2.5">
          {priorityIssues.map((issue) => {
            const Icon = issue.icon;
            return (
              <div
                key={issue.id}
                className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200/60 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 sm:flex-row sm:items-center card-hover-effect"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-slate-400">0{issue.id}</span>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {issue.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  <span className="text-[11px] font-medium text-slate-500">{issue.category}</span>
                  <Badge
                    variant={issue.severity === "High" ? "destructive" : "secondary"}
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  >
                    {issue.severity}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
