"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AigenstraTask,
  ContextPack,
  TaskRecommendation,
  TaskStatus,
  TaskPriority,
  TaskComplexity,
} from "@/types";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Check,
  ChevronRight,
  Bot,
  Layers,
  Database,
  Layout,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Code2,
  ShieldAlert,
  Ban,
  Filter,
  FileCheck,
  CheckCheck,
  Lock,
} from "lucide-react";

interface TaskPlanningViewProps {
  projectId: string;
  projectName: string;
  initialTasks: AigenstraTask[];
  initialRecommendation: TaskRecommendation | null;
  onRefresh?: () => void;
}

export function TaskPlanningView({
  projectId,
  projectName,
  initialTasks,
  initialRecommendation,
  onRefresh,
}: TaskPlanningViewProps) {
  const [tasks, setTasks] = useState<AigenstraTask[]>(initialTasks);
  const [recommendation, setRecommendation] = useState<TaskRecommendation | null>(initialRecommendation);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    initialRecommendation?.recommendedTaskId || initialTasks[0]?.id || ""
  );
  const [contextPack, setContextPack] = useState<ContextPack | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResynthesizing, setIsResynthesizing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleSelectTask = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setLoadingContext(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/context`);
      const data = await res.json();
      if (res.ok && data.contextPack) {
        setContextPack(data.contextPack);
      } else {
        setContextPack(null);
      }
    } catch (err) {
      console.error("Failed to load context pack:", err);
      setContextPack(null);
    } finally {
      setLoadingContext(false);
    }
  };

  const handlePrepareContext = async (taskId: string) => {
    setLoadingContext(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/context`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.contextPack) {
        setContextPack(data.contextPack);
        if (data.task) {
          setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        }
      }
    } catch (err) {
      console.error("Failed to prepare context pack:", err);
    } finally {
      setLoadingContext(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResynthesizeTasks = async () => {
    if (!confirm("Re-synthesizing will analyze current Build Map and Engineering blueprints to refresh tasks. Continue?")) return;
    setIsResynthesizing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error("Failed to re-synthesize tasks:", err);
    } finally {
      setIsResynthesizing(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Play className="w-3 h-3" /> In Progress
          </span>
        );
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3 h-3" /> Ready to Plan
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Backlog
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: "What Should We Build Next?" Recommendation */}
      {recommendation && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Aigenstra Recommendation: What to Build Next
              </span>
            </div>

            <button
              onClick={handleResynthesizeTasks}
              disabled={isResynthesizing}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResynthesizing ? "animate-spin" : ""}`} />
              Re-Evaluate Tasks
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {recommendation.recommendedTaskTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                {recommendation.whyNext}
              </p>
            </div>

            <button
              onClick={() => handleSelectTask(recommendation.recommendedTaskId)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition shrink-0"
            >
              Plan This Task
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1.5">
          {["ALL", "READY", "IN_PROGRESS", "BLOCKED", "BACKLOG", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {st === "ALL" ? "All Tasks" : st.replace("_", " ")}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Main Grid: Tasks List on Left + Task Workspace / Context Pack on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTasks.map((task) => {
            const isSelected = task.id === selectedTask?.id;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase">
                        {task.task_type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {task.complexity} Complexity
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {task.short_description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Stage {task.stageNumber}</span>
                  {task.readiness === "READY_FOR_PROMPT" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Ready for Prompt
                    </span>
                  ) : (
                    <span>Ready to prepare context</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Task Detail & Context Pack Explorer */}
        {selectedTask && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            {/* Task Header & Status Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Task Planning Workspace • Stage {selectedTask.stageNumber}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedTask.title}
                </h2>
              </div>

              {/* Status Update Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["READY", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((st) => {
                  const isActive = selectedTask.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedTask.id, st)}
                      disabled={isUpdating}
                      className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium border ${
                        isActive
                          ? st === "COMPLETED"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : st === "IN_PROGRESS"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {st === "COMPLETED" && <Check className="w-3 h-3 inline mr-1" />}
                      {st === "COMPLETED" ? "Completed" : st === "IN_PROGRESS" ? "In Progress" : "Ready"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task Purpose & User Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-500">Why This Task Exists</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedTask.purpose}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-500">User Value Delivered</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedTask.user_value}
                </p>
              </div>
            </div>

            {/* Observable Acceptance Criteria */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-500" /> Observable Acceptance Criteria
              </div>
              <ul className="space-y-1.5">
                {selectedTask.acceptance_criteria?.map((ac, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{ac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Change Boundaries (Must Change vs Must Not Change) */}
            {selectedTask.change_boundaries && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Must Change
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                    {selectedTask.change_boundaries.mustChange?.join(", ") || "Declared paths"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Must NOT Change
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                    {selectedTask.change_boundaries.mustNotChange?.join(", ") || "Protected paths"}
                  </div>
                </div>
              </div>
            )}

            {/* Context Pack Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    Target Context Pack for Coding Agent
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Smallest sufficient set of project intelligence selected specifically for this task.
                  </p>
                </div>

                <button
                  onClick={() => handlePrepareContext(selectedTask.id)}
                  disabled={loadingContext}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingContext ? "animate-spin" : ""}`} />
                  {contextPack ? "Refresh Context Pack" : "Prepare Context Pack"}
                </button>
              </div>

              {/* Context Pack Content */}
              {contextPack && (
                <div className="space-y-4">
                  {/* Context Size Badge */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Curation:</strong> {contextPack.summary}
                    </div>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 shrink-0 ml-2">
                      {contextPack.estimatedSize?.label}
                    </span>
                  </div>

                  {/* Connected Repository Context (Phase 6) */}
                  {contextPack.repository && contextPack.repository.relevantFiles.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-indigo-400">
                        <span className="flex items-center gap-1.5">
                          Codebase Context Found ({contextPack.repository.relevantFiles.length} Target Files)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {contextPack.repository.detectedStack}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {contextPack.repository.relevantFiles.map((rf, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-800/80 text-[11px]">
                            <span className="font-mono text-emerald-300 truncate max-w-xs">{rf.filePath}</span>
                            <span className="text-slate-400 text-[10px]">{rf.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Included Context Items */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Included Project Context ({contextPack.includedItems?.length || 0} Items)
                    </div>
                    <div className="space-y-2">
                      {contextPack.includedItems?.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                              {item.source}
                            </span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            <strong>Reason:</strong> {item.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excluded Context Items (Why Left Out) */}
                  {contextPack.excludedItems?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Intentionally Excluded ({contextPack.excludedItems.length} Items)
                      </div>
                      <div className="space-y-1.5">
                        {contextPack.excludedItems.map((ex) => (
                          <div
                            key={ex.id}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              ○ {ex.title} ({ex.source})
                            </span>
                            <span className="text-[11px] text-slate-400 italic">{ex.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Confirmation & Direct Compile Button */}
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Task & Context Pack are locked and ready for Prompt Compilation.</span>
                    </div>
                    <Link
                      href={`/projects/${projectId}/prompts`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Compile Coding Prompt
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
