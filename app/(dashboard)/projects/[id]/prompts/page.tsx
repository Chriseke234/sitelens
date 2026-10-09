"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Terminal,
  Sparkles,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  ListTodo,
  Bot,
  Cpu,
  ArrowRight,
} from "lucide-react";
import {
  PromptCategory,
  CodingAgentProfile,
  BuildSessionStatus,
  CompiledPrompt,
  AigenstraTask,
} from "@/types";
import { PromptStudioView } from "@/components/projects/prompt-studio-view";
import { compileTaskPrompt } from "@/lib/ai/prompt-compiler";

export default function PromptsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<CodingAgentProfile>("Antigravity");
  const [activePrompt, setActivePrompt] = useState<CompiledPrompt | null>(null);
  const [tasks, setTasks] = useState<AigenstraTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{ name: string; description: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [projectId]);

  const fetchInitialData = async () => {
    try {
      // Fetch tasks for this project
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      const tasksData = await tasksRes.json();
      
      let projectTasks: AigenstraTask[] = [];
      if (tasksRes.ok && Array.isArray(tasksData.tasks) && tasksData.tasks.length > 0) {
        projectTasks = tasksData.tasks;
        setTasks(projectTasks);
        setSelectedTaskId(projectTasks[0].id);
      }

      // Fetch project details
      const projRes = await fetch(`/api/projects/${projectId}`);
      const projData = await projRes.json();
      const projName = projData?.project?.name || "Aigenstra Project";
      const projDesc = projData?.project?.description || "Vibe-coding product architecture";
      setProjectInfo({ name: projName, description: projDesc });

      // Only compile prompt if real tasks exist in the database
      if (projectTasks.length > 0) {
        await handleCompilePromptForTask(projectTasks[0], "Antigravity", projName, projDesc);
      } else {
        setTasks([]);
        setSelectedTaskId(null);
        setActivePrompt(null);
      }
    } catch (err) {
      console.error("Failed to load prompt studio data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompilePromptForTask = async (
    targetTask: AigenstraTask,
    agent: CodingAgentProfile,
    name?: string,
    desc?: string
  ) => {
    setCompiling(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${targetTask.id}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: targetTask,
          targetAgent: agent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.prompt) {
        setActivePrompt(data.prompt);
      } else {
        // Fallback local compilation if route has offline status
        const localPrompt = await compileTaskPrompt(
          targetTask,
          name || projectInfo?.name || "Aigenstra Project",
          desc || projectInfo?.description || "Product workspace",
          agent
        );
        setActivePrompt(localPrompt);
      }
    } catch (err) {
      console.error("Compile prompt error:", err);
    } finally {
      setCompiling(false);
    }
  };

  const handleSelectAgent = async (agent: CodingAgentProfile) => {
    setSelectedAgent(agent);
    const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
    if (currentTask) {
      await handleCompilePromptForTask(currentTask, agent);
    }
  };

  const handleSelectTask = async (taskId: string) => {
    setSelectedTaskId(taskId);
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask) {
      await handleCompilePromptForTask(targetTask, selectedAgent);
    }
  };

  const handleUpdateTaskStatus = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (!selectedTaskId) return;
    try {
      await fetch(`/api/projects/${projectId}/tasks/${selectedTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      // update local task state
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTaskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
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
      {/* Stage Header Banner */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <Terminal className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>STAGE 03 · PROMPT STUDIO</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808]">
              Agent Prompt Studio
            </h1>
            <p className="text-xs font-medium text-[#080808]/75">
              Generate 12-section context-engineered prompts tailored specifically for {selectedAgent || "your AI agent"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] px-3 py-2 text-right shadow-[2px_2px_0px_#080808]">
              <div className="text-[10px] font-black uppercase text-[#080808]/60">Target Agent</div>
              <div className="text-xs font-black uppercase text-[#080808]">{selectedAgent}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Tasks Found vs Zero Fiction Empty State */}
      {tasks.length === 0 ? (
        <div className="border-[3px] border-[#080808] bg-white p-8 text-center shadow-[5px_5px_0px_#080808]">
          <div className="flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
            <div className="flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[2.5px_2.5px_0px_#080808]">
              <ListTodo className="h-7 w-7 stroke-[2.5] text-[#080808]" />
            </div>
            <h3 className="text-base font-black uppercase text-[#080808]">
              No Build Tasks Generated Yet
            </h3>
            <p className="text-xs font-medium text-[#080808]/75 leading-relaxed">
              Coding prompts are compiled directly from your project&apos;s build sequence and software blueprint. Synthesize your blueprint in Stage 02 first to create actionable tasks for your coding agent.
            </p>
            <Link
              href={`/projects/${projectId}/product`}
              className="inline-flex items-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:bg-[#080808] hover:text-[#FFE500] active:translate-y-0.5"
            >
              <span>Go to Stage 02: Blueprint →</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Task Selector Bento Bar */}
          <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-black uppercase text-[#080808] shrink-0">
                  Select Task Target:
                </span>
                <select
                  value={selectedTaskId || ""}
                  onChange={(e) => handleSelectTask(e.target.value)}
                  className="w-full sm:w-auto border-2 border-[#080808] bg-[#F8F6EC] px-3 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.complexity || "MEDIUM"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
                  if (currentTask) handleCompilePromptForTask(currentTask, selectedAgent);
                }}
                disabled={compiling}
                className="inline-flex shrink-0 items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] active:translate-y-0.5 disabled:opacity-50"
              >
                {compiling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" /> Recompile Prompt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Prompt Studio View */}
          {activePrompt ? (
            <PromptStudioView
              prompt={activePrompt}
              onSelectAgent={handleSelectAgent}
              onRecompile={() => {
                const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
                if (currentTask) handleCompilePromptForTask(currentTask, selectedAgent);
              }}
              isCompiling={compiling}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC] p-12 text-center">
              <Terminal className="h-10 w-10 stroke-[2] text-[#080808]" />
              <h3 className="mt-3 text-sm font-black uppercase text-[#080808]">
                No Prompt Selected
              </h3>
              <p className="mt-1 text-xs font-medium text-[#080808]/70">
                Select a task above to formulate your precision coding prompt.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
