"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Terminal,
  Sparkles,
  Loader2,
  ListTodo,
  Bot,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  CodingAgentProfile,
  CompiledPrompt,
  AigenstraTask,
  DiscoveryQnA,
  SoftwareBlueprint,
} from "@/types";
import { PromptStudioView } from "@/components/projects/prompt-studio-view";

export default function PromptsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [isDiscoveryComplete, setIsDiscoveryComplete] = useState(false);
  const [qnaList, setQnaList] = useState<DiscoveryQnA[]>([]);
  const [blueprint, setBlueprint] = useState<SoftwareBlueprint | null>(null);
  const [selectedAgent, setSelectedAgent] =
    useState<CodingAgentProfile>("Antigravity");
  const [activePrompt, setActivePrompt] = useState<CompiledPrompt | null>(null);
  const [tasks, setTasks] = useState<AigenstraTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{
    name: string;
    description: string;
    productType: string;
  } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [projectId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Check discovery completion gate first (Process 1: Idea & Architecture)
      const discRes = await fetch(`/api/projects/${projectId}/discovery`);
      const discData = await discRes.json();

      const complete = Boolean(discData?.isDiscoveryComplete);
      setIsDiscoveryComplete(complete);
      setQnaList(discData?.qnaList || []);

      if (discData?.project) {
        setProjectInfo({
          name: discData.project.name || "Project",
          description:
            discData.project.raw_idea || discData.project.description || "",
          productType: discData.project.product_type || "Web App",
        });
        if (discData.project.coding_environment) {
          setSelectedAgent(
            discData.project.coding_environment as CodingAgentProfile
          );
        }
      }

      // STRICT GATING: Do not load or generate tasks/prompts if Process 1 is incomplete
      if (!complete) {
        setTasks([]);
        setSelectedTaskId(null);
        setActivePrompt(null);
        return;
      }

      // 2. Process 1 is complete: fetch or synthesize tasks & blueprint
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      const tasksData = await tasksRes.json();

      let projectTasks: AigenstraTask[] = [];
      if (
        tasksRes.ok &&
        Array.isArray(tasksData.tasks) &&
        tasksData.tasks.length > 0
      ) {
        projectTasks = tasksData.tasks;
        if (tasksData.blueprint) {
          setBlueprint(tasksData.blueprint);
        }
      } else {
        const genRes = await fetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (genRes.ok) {
          const genData = await genRes.json();
          if (Array.isArray(genData.tasks) && genData.tasks.length > 0) {
            projectTasks = genData.tasks;
          }
          if (genData.blueprint) {
            setBlueprint(genData.blueprint);
          }
        }
      }

      if (projectTasks.length > 0) {
        setTasks(projectTasks);
        setSelectedTaskId(projectTasks[0].id);
        const agentToUse =
          (discData?.project?.coding_environment as CodingAgentProfile) ||
          selectedAgent;
        await handleCompilePromptForTask(projectTasks[0], agentToUse);
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
    agent: CodingAgentProfile
  ) => {
    setCompiling(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${targetTask.id}/prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: targetTask,
            targetAgent: agent,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.prompt) {
        setActivePrompt(data.prompt);
        if (data.blueprint) {
          setBlueprint(data.blueprint);
        }
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

  const handleUpdateTaskStatus = async (
    newStatus: "IN_PROGRESS" | "COMPLETED"
  ) => {
    if (!selectedTaskId) return;
    try {
      await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selectedTaskId, status: newStatus }),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTaskId ? { ...t, status: newStatus } : t
        )
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

  // Strict Gating: If Process 1 (1. Idea & Architecture) is not finished, block Process 2 view
  if (!isDiscoveryComplete) {
    const answeredCount = qnaList.filter(
      (q) => q.answer && q.answer.trim().length > 0
    ).length;
    return (
      <div className="border-[3px] border-[#080808] bg-white p-8 text-center shadow-[6px_6px_0px_#080808] font-mono">
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[2.5px_2.5px_0px_#080808]">
            <Lock className="h-7 w-7 stroke-[2.5] text-[#080808]" />
          </div>
          <span className="border border-[#080808] bg-[#F8F6EC] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808]">
            Process 1 Required ({answeredCount}/{qnaList.length || "—"} Answered)
          </span>
          <h2 className="text-lg font-black uppercase text-[#080808]">
            Complete 1. Idea & Architecture First
          </h2>
          <p className="text-xs font-medium text-[#080808]/75 leading-relaxed">
            Agent Prompts & Wireframe Specifications are synthesized in real time
            strictly from your confirmed discovery answers. Finish answering the
            tailored questions in <strong>1. Idea & Architecture</strong> to unlock
            this view.
          </p>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:bg-[#080808] hover:text-[#FFE500]"
          >
            <Bot className="h-4 w-4 stroke-[2.5]" />
            <span>Go to 1. Idea & Architecture</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>
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
              <span>PROCESS 02 · AGENT PROMPTS & WIREFRAME</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808]">
              Agent Prompt & Wireframe Studio
            </h1>
            <p className="text-xs font-medium text-[#080808]/75">
              Real-time 12-section context-engineered prompts tailored specifically for{" "}
              {selectedAgent || "your AI coding agent"} and grounded in your confirmed{" "}
              {projectInfo?.productType || "product"} decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] px-3 py-2 text-right shadow-[2px_2px_0px_#080808]">
              <div className="text-[10px] font-black uppercase text-[#080808]/60">
                Target Agent
              </div>
              <div className="text-xs font-black uppercase text-[#080808]">
                {selectedAgent}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {tasks.length === 0 ? (
        <div className="border-[3px] border-[#080808] bg-white p-8 text-center shadow-[5px_5px_0px_#080808]">
          <div className="flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
            <div className="flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[2.5px_2.5px_0px_#080808]">
              <ListTodo className="h-7 w-7 stroke-[2.5] text-[#080808]" />
            </div>
            <h3 className="text-base font-black uppercase text-[#080808]">
              No Build Tasks Synthesized Yet
            </h3>
            <p className="text-xs font-medium text-[#080808]/75 leading-relaxed">
              Return to the AI Studio to synthesize your real-time tasks from your
              confirmed discovery decisions.
            </p>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:bg-[#080808] hover:text-[#FFE500]"
            >
              <span>Open AI Studio</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
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
                  {tasks.map((t, idx) => (
                    <option key={t.id} value={t.id}>
                      {idx + 1}. {t.title} ({t.complexity || "MEDIUM"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentTask =
                    tasks.find((t) => t.id === selectedTaskId) || tasks[0];
                  if (currentTask)
                    handleCompilePromptForTask(currentTask, selectedAgent);
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
                    <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" /> Recompile
                    Prompt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Prompt Studio View */}
          {activePrompt ? (
            <PromptStudioView
              prompt={activePrompt}
              task={
                tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null
              }
              blueprint={blueprint}
              qnaList={qnaList}
              projectName={projectInfo?.name || "Project"}
              onSelectAgent={handleSelectAgent}
              onRecompile={() => {
                const currentTask =
                  tasks.find((t) => t.id === selectedTaskId) || tasks[0];
                if (currentTask)
                  handleCompilePromptForTask(currentTask, selectedAgent);
              }}
              isCompiling={compiling}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC] p-12 text-center">
              <Terminal className="h-10 w-10 stroke-[2] text-[#080808]" />
              <h3 className="mt-3 text-sm font-black uppercase text-[#080808]">
                Compiling Prompt...
              </h3>
              <p className="mt-1 text-xs font-medium text-[#080808]/70">
                Select a task above to formulate your real-time coding prompt.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
