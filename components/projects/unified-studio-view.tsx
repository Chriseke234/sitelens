"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Terminal,
  Send,
  Loader2,
  Copy,
  Check,
  Layout,
  Database,
  Lock,
  Code2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowRight,
  Bot,
  RefreshCw,
  Info,
  Search,
  Layers,
  ShieldCheck,
  FileCode,
  HelpCircle,
} from "lucide-react";
import {
  Project,
  AigenstraTask,
  CompiledPrompt,
  CodingAgentProfile,
  DiscoveryQnA,
  SoftwareBlueprint,
} from "@/types";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  kind?: "research" | "question" | "answer" | "status";
}

interface UnifiedStudioViewProps {
  project: Project;
  initialTasks?: AigenstraTask[];
  initialBlueprint?: SoftwareBlueprint | null;
  initialPrompt?: CompiledPrompt | null;
  initialIsDiscoveryComplete?: boolean;
}

export function UnifiedStudioView({
  project,
  initialTasks = [],
  initialBlueprint = null,
  initialPrompt = null,
  initialIsDiscoveryComplete = false,
}: UnifiedStudioViewProps) {
  // Strict Two-Format Process State:
  // "chat"    = 1. Idea & Architecture (AI Research + Tailored Discovery Questions)
  // "prompts" = 2. Agent Prompts & Wireframe (Strictly gated until Process 1 is 100% answered)
  const [activeMode, setActiveMode] = useState<"chat" | "prompts">("chat");
  const [isDiscoveryComplete, setIsDiscoveryComplete] = useState<boolean>(
    initialIsDiscoveryComplete
  );

  // Discovery & Research State (Process 1)
  const [researchDoc, setResearchDoc] = useState<any>(null);
  const [qnaList, setQnaList] = useState<DiscoveryQnA[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Tasks, Blueprint, Wireframe & Prompts State (Process 2)
  const [blueprint, setBlueprint] = useState<SoftwareBlueprint | null>(
    initialBlueprint
  );
  const [tasks, setTasks] = useState<AigenstraTask[]>(
    initialIsDiscoveryComplete ? initialTasks : []
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialIsDiscoveryComplete ? initialTasks[0]?.id || null : null
  );
  const [selectedAgent, setSelectedAgent] = useState<CodingAgentProfile>(
    (project.coding_environment as CodingAgentProfile) || "Antigravity"
  );
  const [activePrompt, setActivePrompt] = useState<CompiledPrompt | null>(
    initialIsDiscoveryComplete ? initialPrompt : null
  );
  const [promptViewTab, setPromptViewTab] = useState<"markdown" | "sections">(
    "markdown"
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSynthesizingProcess2, setIsSynthesizingProcess2] = useState(false);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enforce strict gating: never allow "prompts" mode if discovery is incomplete
  useEffect(() => {
    if (!isDiscoveryComplete && activeMode !== "chat") {
      setActiveMode("chat");
    }
  }, [isDiscoveryComplete, activeMode]);

  // Auto-scroll chat stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isSynthesizingProcess2]);

  // Initial Load: Run/Fetch AI Research first, then load tailored Discovery Questions
  useEffect(() => {
    loadStudioData();
  }, [project.id]);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const buildChatTranscript = (
    loadedResearch: any,
    loadedQnas: DiscoveryQnA[],
    complete: boolean,
    loadedTasksCount: number
  ): Message[] => {
    const transcript: Message[] = [];

    // 1. Greeting + Product Type Context
    transcript.push({
      id: "msg_intro",
      sender: "assistant",
      kind: "status",
      text: `Welcome to **1. Idea & Architecture** for **${project.name}** (${
        project.product_type || "Web App"
      }).\n\nYour product vision:\n> "${
        project.raw_idea || project.description
      }"\n\nI have completed real-time domain & architecture research tailored specifically to a **${
        project.product_type || "Web App"
      }** product before formulating your discovery questions.`,
      timestamp: formatTime(),
    });

    // 2. Real-Time AI Research Summary
    if (loadedResearch) {
      const recFeatures = Array.isArray(loadedResearch.recommended_features)
        ? loadedResearch.recommended_features
            .slice(0, 4)
            .map(
              (f: any) =>
                `• **${f.title || "Capability"}**: ${f.rationale || ""}`
            )
            .join("\n")
        : "";

      const keyNeeds = Array.isArray(loadedResearch.user_needs)
        ? loadedResearch.user_needs
            .slice(0, 3)
            .map((n: string) => `• ${n}`)
            .join("\n")
        : "";

      transcript.push({
        id: "msg_research",
        sender: "assistant",
        kind: "research",
        text: [
          `**Real-Time AI Research Findings (${project.product_type || "Product"})**`,
          loadedResearch.market_summary
            ? `\n**Domain & Market Analysis:**\n${loadedResearch.market_summary}`
            : null,
          recFeatures
            ? `\n**Recommended ${project.product_type || "Product"} Architecture Capabilities:**\n${recFeatures}`
            : null,
          keyNeeds ? `\n**Core User Needs Identified:**\n${keyNeeds}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        timestamp: formatTime(),
      });
    }

    // 3. Answered Questions + Current Unanswered Question (Sequential)
    let shownUnanswered = false;
    loadedQnas.forEach((q, idx) => {
      const hasAnswer = Boolean(q.answer && q.answer.trim().length > 0);

      if (hasAnswer) {
        transcript.push({
          id: `q_${q.id}`,
          sender: "assistant",
          kind: "question",
          text: `**Question ${idx + 1} of ${loadedQnas.length}** [${
            q.category || "ARCHITECTURE"
          }]\n${q.question}${
            q.why_it_matters ? `\n\n*Why this matters:* ${q.why_it_matters}` : ""
          }`,
          timestamp: formatTime(),
        });
        transcript.push({
          id: `a_${q.id}`,
          sender: "user",
          kind: "answer",
          text: q.answer!,
          timestamp: formatTime(),
        });
      } else if (!shownUnanswered) {
        shownUnanswered = true;
        transcript.push({
          id: `q_${q.id}`,
          sender: "assistant",
          kind: "question",
          text: `**Question ${idx + 1} of ${loadedQnas.length}** [${
            q.category || "ARCHITECTURE"
          }]\n${q.question}${
            q.why_it_matters ? `\n\n*Why this matters:* ${q.why_it_matters}` : ""
          }`,
          timestamp: formatTime(),
        });
      }
    });

    if (complete) {
      transcript.push({
        id: "msg_complete",
        sender: "assistant",
        kind: "status",
        text: `All **${loadedQnas.length} of ${loadedQnas.length}** architecture and product discovery questions are answered.\n\n**2. Agent Prompts & Wireframe** is now unlocked${
          loadedTasksCount > 0
            ? ` with **${loadedTasksCount} tailored build tasks** ready for your coding agent.`
            : "."
        }`,
        timestamp: formatTime(),
      });
    }

    return transcript;
  };

  const loadStudioData = async () => {
    setIsLoadingDiscovery(true);
    setDiscoveryError(null);
    try {
      // Step 1: Load AI Research + Research-Backed Discovery Questions
      const discRes = await fetch(`/api/projects/${project.id}/discovery`);
      const discData = await discRes.json();

      if (!discRes.ok) {
        throw new Error(
          discData?.error ||
            "Failed to run AI research and discovery question synthesis."
        );
      }

      const loadedResearch = discData.researchDoc || null;
      const loadedQnas: DiscoveryQnA[] = discData.qnaList || [];
      const complete = Boolean(discData.isDiscoveryComplete);

      setResearchDoc(loadedResearch);
      setQnaList(loadedQnas);
      setIsDiscoveryComplete(complete);

      let loadedTasks: AigenstraTask[] = [];

      // Step 2: ONLY fetch/generate tasks & prompts if Process 1 (Idea & Architecture) is 100% complete
      if (complete) {
        const tasksRes = await fetch(`/api/projects/${project.id}/tasks`);
        const tasksData = await tasksRes.json();

        if (tasksRes.ok && Array.isArray(tasksData.tasks)) {
          loadedTasks = tasksData.tasks;
          setTasks(loadedTasks);
          if (tasksData.blueprint) {
            setBlueprint(tasksData.blueprint);
          }
          if (loadedTasks.length > 0) {
            setSelectedTaskId(loadedTasks[0].id);
            await compilePrompt(loadedTasks[0], selectedAgent);
          }
        }
      } else {
        // Strictly clear Process 2 state while Process 1 is incomplete
        setTasks([]);
        setSelectedTaskId(null);
        setActivePrompt(null);
        setActiveMode("chat");
      }

      setMessages(
        buildChatTranscript(
          loadedResearch,
          loadedQnas,
          complete,
          loadedTasks.length
        )
      );
    } catch (err: any) {
      console.error("Failed to load studio data:", err);
      setDiscoveryError(
        err.message ||
          "Unable to synthesize real-time AI research and discovery questions."
      );
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const handleRerunResearch = async () => {
    setIsLoadingDiscovery(true);
    setDiscoveryError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Failed to refresh AI research.");
      }
      await loadStudioData();
    } catch (err: any) {
      setDiscoveryError(err.message || "Failed to refresh AI research.");
      setIsLoadingDiscovery(false);
    }
  };

  const compilePrompt = async (
    targetTask: AigenstraTask,
    agent: CodingAgentProfile
  ) => {
    setIsCompiling(true);
    try {
      const res = await fetch(
        `/api/projects/${project.id}/tasks/${targetTask.id}/prompt`,
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
      console.error("Failed to compile prompt:", err);
    } finally {
      setIsCompiling(false);
    }
  };

  const submitDiscoveryAnswer = async (answerText: string) => {
    if (!answerText.trim() || isSending || isSynthesizingProcess2) return;

    const cleanAnswer = answerText.trim();
    setInputValue("");

    const currentUnansweredIndex = qnaList.findIndex(
      (q) => !q.answer || !q.answer.trim()
    );
    const currentUnanswered =
      currentUnansweredIndex !== -1 ? qnaList[currentUnansweredIndex] : null;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      kind: "answer",
      text: cleanAnswer,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      // Save the answer to Supabase
      const postBody = currentUnanswered
        ? { qnaId: currentUnanswered.id, answer: cleanAnswer }
        : {
            question: "Additional Product & Architecture Specification",
            answer: cleanAnswer,
            category: "REFINEMENT",
          };

      const discRes = await fetch(`/api/projects/${project.id}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody),
      });

      const discData = await discRes.json();
      if (!discRes.ok) {
        throw new Error(discData?.error || "Failed to save discovery answer.");
      }

      // Update local Q&A state
      const updatedQnas: DiscoveryQnA[] = currentUnanswered
        ? qnaList.map((q) =>
            q.id === currentUnanswered.id ? { ...q, answer: cleanAnswer } : q
          )
        : [...qnaList, ...(discData.qna ? [discData.qna] : [])];

      setQnaList(updatedQnas);

      // Check if any unanswered questions remain in Process 1
      const nextUnansweredIndex = updatedQnas.findIndex(
        (q) => !q.answer || !q.answer.trim()
      );

      if (nextUnansweredIndex !== -1) {
        // Still in Process 1: Present the next tailored question immediately
        const nextQ = updatedQnas[nextUnansweredIndex];
        const nextQuestionMsg: Message = {
          id: `q_${nextQ.id}_${Date.now()}`,
          sender: "assistant",
          kind: "question",
          text: `Recorded. Let's lock in the next architectural decision:\n\n**Question ${
            nextUnansweredIndex + 1
          } of ${updatedQnas.length}** [${nextQ.category || "ARCHITECTURE"}]\n${
            nextQ.question
          }${
            nextQ.why_it_matters
              ? `\n\n*Why this matters:* ${nextQ.why_it_matters}`
              : ""
          }`,
          timestamp: formatTime(),
        };
        setMessages((prev) => [...prev, nextQuestionMsg]);
      } else {
        // Process 1 is now 100% complete! Synthesize Process 2 in real time
        setIsDiscoveryComplete(true);
        setIsSynthesizingProcess2(true);

        const synthRes = await fetch(`/api/projects/${project.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const synthData = await synthRes.json();

        if (!synthRes.ok) {
          throw new Error(
            synthData?.error ||
              "Failed to synthesize blueprint, wireframe, and agent tasks."
          );
        }

        const generatedTasks: AigenstraTask[] = synthData.tasks || [];
        const generatedBlueprint: SoftwareBlueprint | null =
          synthData.blueprint || null;

        setTasks(generatedTasks);
        if (generatedBlueprint) {
          setBlueprint(generatedBlueprint);
        }

        if (generatedTasks.length > 0) {
          setSelectedTaskId(generatedTasks[0].id);
          await compilePrompt(generatedTasks[0], selectedAgent);
        }

        const completionMsg: Message = {
          id: `asst_complete_${Date.now()}`,
          sender: "assistant",
          kind: "status",
          text: `All discovery questions in **1. Idea & Architecture** are now complete!\n\nI have synthesized your real-time **Software Blueprint**, **Wireframe Specification**, and **${generatedTasks.length} tailored coding agent tasks** grounded strictly in your answers. Switching you to **2. Agent Prompts & Wireframe**.`,
          timestamp: formatTime(),
        };

        setMessages((prev) => [...prev, completionMsg]);
        setActiveMode("prompts");
      }
    } catch (err: any) {
      console.error("Error submitting discovery answer:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          kind: "status",
          text: `Error: ${
            err.message || "Failed to process your answer. Please try again."
          }`,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsSending(false);
      setIsSynthesizingProcess2(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitDiscoveryAnswer(inputValue);
  };

  const handleSelectAgent = async (agent: CodingAgentProfile) => {
    setSelectedAgent(agent);
    const curr = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
    if (curr) {
      await compilePrompt(curr, agent);
    }
  };

  const handleSelectTask = async (taskId: string) => {
    setSelectedTaskId(taskId);
    const curr = tasks.find((t) => t.id === taskId);
    if (curr) {
      await compilePrompt(curr, selectedAgent);
    }
  };

  const handleCopyPrompt = () => {
    if (!activePrompt) return;
    navigator.clipboard.writeText(activePrompt.markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPrompt = () => {
    if (!activePrompt) return;
    const blob = new Blob([activePrompt.markdownText], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activePrompt.taskTitle || "PROMPT")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const answeredCount = qnaList.filter(
    (q) => q.answer && q.answer.trim().length > 0
  ).length;
  const totalQuestions = qnaList.length;
  const currentUnansweredQuestion =
    qnaList.find((q) => !q.answer || !q.answer.trim()) || null;

  const currentTask =
    tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null;

  // Match real screens and entities from the synthesized blueprint for the current task
  const matchedScreens =
    blueprint?.screens?.filter(
      (s) =>
        currentTask?.affected_screens?.includes(s.routePath) ||
        currentTask?.affected_screens?.includes(s.screenName)
    ) || [];
  const wireframeScreens =
    matchedScreens.length > 0
      ? matchedScreens
      : blueprint?.screens?.slice(0, 2) || [];

  const matchedEntities =
    blueprint?.dataEntities?.filter((e) =>
      currentTask?.affected_entities?.includes(e.entityName)
    ) || [];
  const wireframeEntities =
    matchedEntities.length > 0
      ? matchedEntities
      : blueprint?.dataEntities?.slice(0, 3) || [];

  return (
    <div className="space-y-6 font-mono text-[#080808]">
      {/* Studio Process Bar: Strictly gates Process 2 until Process 1 is finished */}
      <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                {project.product_type || "PRODUCT"} STUDIO
              </span>

              <span className="border border-[#080808] bg-[#F8F6EC] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                Discovery Progress: {answeredCount}/{totalQuestions || "—"} Answered
              </span>

              {isDiscoveryComplete && tasks.length > 0 && (
                <span className="border border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                  {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} Synthesized
                </span>
              )}
            </div>

            <h2 className="text-lg font-black uppercase tracking-tight text-[#080808] sm:text-xl">
              {activeMode === "chat"
                ? "Process 1: Idea & Architecture Discovery"
                : "Process 2: Agent Prompts & Wireframe Specification"}
            </h2>
            <p className="text-xs font-medium text-[#080808]/75">
              {activeMode === "chat"
                ? "AI researches your product domain first, then asks tailored architectural questions before building your prompts."
                : "Real-time wireframe specification and 12-section coding agent prompts compiled directly from your confirmed answers."}
            </p>
          </div>

          {/* Process Switcher: Process 2 is ONLY rendered after Process 1 is 100% answered */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center border-2 border-[#080808] bg-[#F8F6EC] p-1 shadow-[2px_2px_0px_#080808]">
              <button
                type="button"
                onClick={() => setActiveMode("chat")}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase transition-all ${
                  activeMode === "chat"
                    ? "bg-[#FFE500] text-[#080808] border border-[#080808] shadow-[1.5px_1.5px_0px_#080808]"
                    : "text-[#080808]/70 hover:text-[#080808]"
                }`}
              >
                <Bot className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>1. Idea & Architecture</span>
              </button>

              {isDiscoveryComplete && (
                <button
                  type="button"
                  onClick={() => setActiveMode("prompts")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase transition-all ${
                    activeMode === "prompts"
                      ? "bg-[#FFE500] text-[#080808] border border-[#080808] shadow-[1.5px_1.5px_0px_#080808]"
                      : "text-[#080808]/70 hover:text-[#080808]"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>2. Agent Prompts & Wireframe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS 1: IDEA & ARCHITECTURE (AI Research + Tailored Discovery Q&A) */}
      {activeMode === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Conversational Research & Discovery Stream */}
          <div className="lg:col-span-8 flex flex-col border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808] min-h-[640px] max-h-[760px]">
            {/* Chat Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#080808] bg-[#F8F6EC] p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[1.5px_1.5px_0px_#080808]">
                  <Bot className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-[#080808]">
                    1. Idea & Architecture Copilot ({project.product_type || "Product"})
                  </div>
                  <div className="text-[10px] font-bold text-[#080808]/65">
                    Real-time domain research & tailored discovery (Zero Guesswork)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRerunResearch}
                  disabled={isLoadingDiscovery || isSending}
                  className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-2.5 py-1.5 text-[11px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808] hover:bg-[#FFE500] disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3 w-3 stroke-[2.5] ${
                      isLoadingDiscovery ? "animate-spin" : ""
                    }`}
                  />
                  <span>Re-run Research</span>
                </button>

                {isDiscoveryComplete && (
                  <button
                    type="button"
                    onClick={() => setActiveMode("prompts")}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1.5 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <span>2. Agent Prompts & Wireframe</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
              {isLoadingDiscovery ? (
                <div className="flex flex-col items-center justify-center h-80 text-center space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[3px_3px_0px_#080808]">
                    <Loader2 className="h-6 w-6 animate-spin text-[#080808]" />
                  </div>
                  <div className="text-sm font-black uppercase text-[#080808]">
                    Researching {project.product_type || "Product"} Architecture...
                  </div>
                  <p className="text-xs font-medium text-[#080808]/70 max-w-md leading-relaxed">
                    Analyzing domain patterns, user workflows, and technical trade-offs for{" "}
                    <strong>{project.name}</strong> before formulating your tailored discovery questions.
                  </p>
                </div>
              ) : discoveryError ? (
                <div className="border-2 border-[#080808] bg-[#FF4F9A]/15 p-5 shadow-[3px_3px_0px_#080808] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#080808]">
                    <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
                    <span>Real-Time Research & Discovery Error</span>
                  </div>
                  <p className="text-xs font-medium text-[#080808]/80 leading-relaxed">
                    {discoveryError}
                  </p>
                  <button
                    type="button"
                    onClick={loadStudioData}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]"
                  >
                    <RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Retry Real-Time Synthesis</span>
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((m) => {
                    const isAssistant = m.sender === "assistant";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isAssistant ? "items-start" : "items-end"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-[#080808]/60">
                            {isAssistant
                              ? m.kind === "research"
                                ? "AI Domain Research"
                                : "Aigenstra Architect"
                              : "Your Confirmed Decision"}
                          </span>
                          <span className="text-[9px] text-[#080808]/40">
                            {m.timestamp}
                          </span>
                        </div>

                        <div
                          className={`max-w-[90%] border-2 border-[#080808] p-4 text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-[3px_3px_0px_#080808] ${
                            !isAssistant
                              ? "bg-[#FFE500] text-[#080808]"
                              : m.kind === "research"
                              ? "bg-[#B7FF6A]/25 text-[#080808]"
                              : "bg-[#F8F6EC] text-[#080808]"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}

                  {(isSending || isSynthesizingProcess2) && (
                    <div className="flex items-center gap-2.5 border-2 border-[#080808] bg-[#FFE500] p-3.5 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] w-fit">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {isSynthesizingProcess2
                          ? "All questions answered! Synthesizing Blueprint, Wireframe & 12-Section Agent Prompts..."
                          : "Recording decision & preparing next step..."}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Research-Backed Options Bar (when an unanswered question has options) */}
            {!isLoadingDiscovery &&
              !discoveryError &&
              currentUnansweredQuestion &&
              Array.isArray(currentUnansweredQuestion.suggested_options) &&
              currentUnansweredQuestion.suggested_options.length > 0 && (
                <div className="border-t-2 border-[#080808] bg-[#F8F6EC] px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#080808]/75">
                      Researched Options for Question {answeredCount + 1} of{" "}
                      {totalQuestions} (Click to select or type below):
                    </span>
                    {currentUnansweredQuestion.default_recommendation && (
                      <span className="border border-[#080808] bg-[#B7FF6A] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#080808]">
                        Recommended:{" "}
                        {currentUnansweredQuestion.default_recommendation}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUnansweredQuestion.suggested_options.map(
                      (option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isSending || isSynthesizingProcess2}
                          onClick={() => submitDiscoveryAnswer(option)}
                          className="border-2 border-[#080808] bg-white px-3 py-1.5 text-left text-[11px] font-bold text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] active:translate-y-0.5 disabled:opacity-50 transition-all"
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="border-t-[3px] border-[#080808] bg-[#F8F6EC] p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentUnansweredQuestion
                    ? `Answer Question ${answeredCount + 1} of ${totalQuestions} for ${project.name}...`
                    : "Add an architectural refinement or requirement..."
                }
                className="flex-1 border-2 border-[#080808] bg-white px-4 py-2.5 text-xs font-mono font-medium text-[#080808] shadow-[2px_2px_0px_#080808] placeholder:text-[#080808]/45 focus:outline-none"
                disabled={
                  isLoadingDiscovery || isSending || isSynthesizingProcess2
                }
              />
              <button
                type="submit"
                disabled={
                  !inputValue.trim() ||
                  isLoadingDiscovery ||
                  isSending ||
                  isSynthesizingProcess2
                }
                className="inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] disabled:opacity-50 transition-all"
              >
                {isSending || isSynthesizingProcess2 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live Research & Discovery Checklist Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI Research Brief Card */}
            <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                  <Search className="h-4 w-4 stroke-[2.5]" />
                  <span>AI Research Brief</span>
                </div>
                <span className="border border-[#080808] bg-[#FFE500] px-2 py-0.5 text-[9px] font-black uppercase">
                  {project.product_type || "Web App"}
                </span>
              </div>

              {researchDoc ? (
                <div className="space-y-3 text-xs">
                  <div className="border border-[#080808] bg-[#F8F6EC] p-3 space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#080808]/60">
                      Domain & Architecture Summary
                    </div>
                    <p className="font-medium text-[#080808]/85 leading-relaxed">
                      {researchDoc.market_summary}
                    </p>
                  </div>

                  {Array.isArray(researchDoc.recommended_features) &&
                    researchDoc.recommended_features.length > 0 && (
                      <div className="border border-[#080808] bg-[#F8F6EC] p-3 space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-[#080808]/60">
                          Researched {project.product_type} Capabilities
                        </div>
                        <ul className="space-y-1.5">
                          {researchDoc.recommended_features
                            .slice(0, 4)
                            .map((feat: any, i: number) => (
                              <li
                                key={i}
                                className="text-[11px] font-medium text-[#080808] border-l-2 border-[#080808] pl-2"
                              >
                                <strong className="font-black">
                                  {feat.title || "Capability"}:
                                </strong>{" "}
                                {feat.rationale}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  {Array.isArray(researchDoc.risks) &&
                    researchDoc.risks.length > 0 && (
                      <div className="border border-[#080808] bg-[#FF4F9A]/10 p-3 space-y-1">
                        <div className="text-[10px] font-black uppercase text-[#080808]">
                          Architectural Risks to Mitigate
                        </div>
                        <ul className="space-y-1 text-[11px] font-medium text-[#080808]/85">
                          {researchDoc.risks
                            .slice(0, 3)
                            .map((risk: string, i: number) => (
                              <li key={i}>• {risk}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="border border-dashed border-[#080808] bg-[#F8F6EC] p-4 text-center text-xs text-[#080808]/70">
                  {isLoadingDiscovery
                    ? "Synthesizing domain research..."
                    : "Click Re-run Research to analyze your product domain."}
                </div>
              )}
            </div>

            {/* Discovery Question Checklist Card */}
            <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                  <HelpCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Discovery Questions</span>
                </div>
                <span className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {qnaList.map((q, idx) => {
                  const isAnswered = Boolean(q.answer && q.answer.trim());
                  const isCurrent =
                    currentUnansweredQuestion?.id === q.id && !isAnswered;
                  return (
                    <div
                      key={q.id}
                      className={`border-2 border-[#080808] p-2.5 text-[11px] space-y-1 ${
                        isAnswered
                          ? "bg-[#B7FF6A]/25"
                          : isCurrent
                          ? "bg-[#FFE500]/40 shadow-[2px_2px_0px_#080808]"
                          : "bg-[#F8F6EC] opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black uppercase text-[10px]">
                          Q{idx + 1} · {q.category || "SPEC"}
                        </span>
                        {isAnswered ? (
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5] text-[#080808] shrink-0" />
                        ) : isCurrent ? (
                          <span className="border border-[#080808] bg-[#FFE500] px-1 text-[9px] font-black uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase text-[#080808]/60">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-[#080808] leading-snug">
                        {q.question}
                      </div>
                      {isAnswered && (
                        <div className="border-t border-[#080808]/20 pt-1 text-[10px] font-medium text-[#080808]/85">
                          <strong>Answer:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isDiscoveryComplete && (
                <button
                  type="button"
                  onClick={() => setActiveMode("prompts")}
                  className="w-full inline-flex items-center justify-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] py-3 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] transition-all"
                >
                  <Terminal className="h-4 w-4 stroke-[2.5]" />
                  <span>Open 2. Agent Prompts & Wireframe</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROCESS 2: AGENT PROMPTS & WIREFRAME (Strictly rendered ONLY when isDiscoveryComplete === true) */}
      {isDiscoveryComplete && activeMode === "prompts" && (
        <div className="space-y-6">
          {/* Coding Agent Profile & Task Selector Bar */}
          <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[5px_5px_0px_#080808] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#080808] pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                <span className="text-xs font-black uppercase text-[#080808]">
                  Target Coding Agent Profile:
                </span>
                <span className="border border-[#080808] bg-[#FFE500] px-2 py-0.5 text-xs font-black uppercase text-[#080808]">
                  {selectedAgent}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    "Antigravity",
                    "Claude Code",
                    "Cursor",
                    "Codex",
                    "Generic",
                  ] as CodingAgentProfile[]
                ).map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => handleSelectAgent(ag)}
                    disabled={isCompiling}
                    className={`border-2 border-[#080808] px-3 py-1.5 text-xs font-black uppercase transition-all ${
                      selectedAgent === ag
                        ? "bg-[#FFE500] text-[#080808] shadow-[2px_2px_0px_#080808] -translate-y-0.5"
                        : "bg-[#F8F6EC] text-[#080808] hover:bg-white"
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Selector & Prompt Actions */}
            {tasks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-black uppercase text-[#080808] shrink-0">
                    Implementation Task ({tasks.length}):
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      currentTask && compilePrompt(currentTask, selectedAgent)
                    }
                    disabled={isCompiling || !currentTask}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#F8F6EC] px-3 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-white disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 stroke-[2.5] ${
                        isCompiling ? "animate-spin" : ""
                      }`}
                    />
                    <span>Recompile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    disabled={!activePrompt}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] transition-all disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPrompt}
                    disabled={!activePrompt}
                    className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-3 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#F8F6EC] disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>.md</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Split Pane: Left = Real-Time Wireframe & Architecture Spec; Right = 12-Section Agent Prompt */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Real-Time Product Wireframe & Architecture Specification */}
            <div className="lg:col-span-5 flex flex-col justify-between border-[3px] border-[#080808] bg-white p-5 shadow-[6px_6px_0px_#080808] space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                    <span className="text-xs font-black uppercase text-[#080808]">
                      Real-Time Wireframe & Task Spec
                    </span>
                  </div>
                  <span className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[9px] font-black uppercase">
                    {project.product_type || "Product"} Spec
                  </span>
                </div>

                {/* Current Task Objective & User Value */}
                {currentTask && (
                  <div className="border-2 border-[#080808] bg-[#FFE500]/25 p-3.5 shadow-[2.5px_2.5px_0px_#080808] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-[#080808]/70">
                        Active Task Deliverable
                      </span>
                      <span className="border border-[#080808] bg-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                        {currentTask.task_type}
                      </span>
                    </div>
                    <div className="text-xs font-black uppercase text-[#080808]">
                      {currentTask.title}
                    </div>
                    <p className="text-[11px] font-medium text-[#080808]/85 leading-relaxed">
                      {currentTask.purpose || currentTask.short_description}
                    </p>
                  </div>
                )}

                {/* Screen & Component Wireframe Blueprint */}
                <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3.5 shadow-[2.5px_2.5px_0px_#080808] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#080808] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-[#080808] bg-[#FF4F9A]" />
                      <span className="h-2.5 w-2.5 rounded-full border border-[#080808] bg-[#FFE500]" />
                      <span className="h-2.5 w-2.5 rounded-full border border-[#080808] bg-[#B7FF6A]" />
                      <span className="ml-1 text-[10px] font-black uppercase text-[#080808]">
                        Screen & Component Wireframe
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#080808]/70">
                      {currentTask?.affected_screens?.[0] ||
                        wireframeScreens[0]?.routePath ||
                        "/"}
                    </span>
                  </div>

                  {wireframeScreens.length > 0 ? (
                    <div className="space-y-2.5">
                      {wireframeScreens.map((scr) => (
                        <div
                          key={scr.id}
                          className="border border-[#080808] bg-white p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black uppercase text-[#080808]">
                              {scr.screenName}
                            </span>
                            <code className="border border-[#080808] bg-[#F8F6EC] px-1.5 py-0.5 text-[10px] font-black text-[#080808]">
                              {scr.routePath}
                            </code>
                          </div>
                          <p className="text-[11px] font-medium text-[#080808]/75">
                            {scr.simplePurpose}
                          </p>
                          {Array.isArray(scr.keyComponents) &&
                            scr.keyComponents.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <div className="text-[9px] font-black uppercase text-[#080808]/60">
                                  Wireframe UI Components:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {scr.keyComponents.map((comp, idx) => (
                                    <div
                                      key={idx}
                                      className="border border-[#080808] bg-[#F8F6EC] px-2 py-1 text-[10px] font-bold text-[#080808] flex items-center gap-1.5"
                                    >
                                      <Layers className="h-3 w-3 shrink-0 stroke-[2.5]" />
                                      <span className="truncate">{comp}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-[#080808] bg-white p-3 text-xs font-medium text-[#080808]/80">
                      Affected Routes:{" "}
                      {currentTask?.affected_screens?.join(", ") ||
                        "Backend / Schema Task"}
                    </div>
                  )}
                </div>

                {/* Data Entities & Fields */}
                {wireframeEntities.length > 0 && (
                  <div className="border-2 border-[#080808] bg-white p-3.5 shadow-[2.5px_2.5px_0px_#080808] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                      <Database className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Data Entities & Schema Fields</span>
                    </div>
                    <div className="space-y-2">
                      {wireframeEntities.map((ent) => (
                        <div
                          key={ent.id}
                          className="border border-[#080808] bg-[#F8F6EC] p-2.5 space-y-1"
                        >
                          <div className="text-[11px] font-black uppercase text-[#080808]">
                            {ent.entityName}
                          </div>
                          <div className="text-[10px] font-medium text-[#080808]/75">
                            {ent.simpleDescription}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(ent.attributes || []).map((attr, idx) => (
                              <span
                                key={idx}
                                className="border border-[#080808] bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#080808]"
                              >
                                {attr.name}: {attr.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmed Discovery Decisions Grounding This Task */}
                {qnaList.length > 0 && (
                  <div className="border-2 border-[#080808] bg-white p-3.5 shadow-[2.5px_2.5px_0px_#080808] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                      <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Confirmed User Decisions Applied</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {qnaList.map((q, idx) => (
                        <div
                          key={q.id}
                          className="border-l-2 border-[#080808] pl-2 text-[10px] leading-snug"
                        >
                          <span className="font-black uppercase">
                            D{idx + 1} ({q.category || "SPEC"}):
                          </span>{" "}
                          <span className="font-medium text-[#080808]/85">
                            {q.answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Change Boundaries & Acceptance Criteria */}
              {currentTask && (
                <div className="space-y-3 pt-3 border-t-2 border-[#080808]">
                  {currentTask.acceptance_criteria?.length > 0 && (
                    <div className="border-2 border-[#080808] bg-[#B7FF6A]/20 p-3 text-[11px] space-y-1">
                      <span className="font-black uppercase block">
                        Verifiable Acceptance Criteria:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 font-medium text-[#080808]/90">
                        {currentTask.acceptance_criteria.map((crit, idx) => (
                          <li key={idx}>{crit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-2 border-[#080808] bg-white p-3 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 font-black uppercase text-[#080808] mb-1">
                      <Lock className="h-3 w-3 stroke-[2.5]" />
                      <span>Strict File Change Boundaries</span>
                    </div>
                    <div>
                      <strong>MUST CHANGE:</strong>{" "}
                      {currentTask.change_boundaries?.mustChange?.join(", ") ||
                        "See prompt specification"}
                    </div>
                    <div>
                      <strong>MUST NOT CHANGE:</strong>{" "}
                      {currentTask.change_boundaries?.mustNotChange?.join(
                        ", "
                      ) || "Unrelated modules"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Real-Time Compiled 12-Section Agent Prompt */}
            <div className="lg:col-span-7 border-[3px] border-[#080808] bg-[#080808] shadow-[6px_6px_0px_#080808] flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1a1a1a] bg-[#141414] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#FFE500]" />
                  <span className="text-xs font-mono font-bold text-[#FFE500]">
                    {selectedAgent.toUpperCase()}_PROMPT.md
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPromptViewTab("markdown")}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase border ${
                      promptViewTab === "markdown"
                        ? "border-[#FFE500] bg-[#FFE500] text-[#080808]"
                        : "border-white/20 bg-transparent text-white/80 hover:text-white"
                    }`}
                  >
                    Full Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptViewTab("sections")}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase border ${
                      promptViewTab === "sections"
                        ? "border-[#FFE500] bg-[#FFE500] text-[#080808]"
                        : "border-white/20 bg-transparent text-white/80 hover:text-white"
                    }`}
                  >
                    12 Sections ({activePrompt?.sections?.length || 12})
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    disabled={!activePrompt}
                    className="flex items-center gap-1.5 border border-[#B7FF6A] bg-[#B7FF6A] px-3 py-1 text-[10px] font-black uppercase text-[#080808] hover:bg-white transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto max-h-[680px]">
                {isCompiling ? (
                  <div className="flex flex-col items-center justify-center h-64 text-green-400 font-mono text-xs gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>
                      Synthesizing real-time 12-section prompt for{" "}
                      {selectedAgent}...
                    </span>
                  </div>
                ) : activePrompt ? (
                  promptViewTab === "markdown" ? (
                    <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
                      {activePrompt.markdownText}
                    </pre>
                  ) : (
                    <div className="space-y-3">
                      {activePrompt.sections.map((sec) => (
                        <div
                          key={sec.key}
                          className="border border-white/20 bg-[#141414] p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-[#FFE500]">
                              {sec.title}
                            </span>
                            <span className="text-[10px] font-mono text-white/50">
                              {sec.key}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-white/60">
                            {sec.purpose}
                          </div>
                          <pre className="pt-2 font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed border-t border-white/10">
                            {sec.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center text-xs text-slate-400 py-12">
                    Select a task above to compile its real-time coding prompt.
                  </div>
                )}
              </div>

              <div className="border-t-2 border-[#1a1a1a] bg-[#141414] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <span>
                  Tailored for {selectedAgent} · {project.product_type || "Product"}
                </span>
                <span>
                  Readiness: {activePrompt?.readinessScore || 100}% · Optimized Tokens: ~
                  {activePrompt?.optimization.optimizedEstimatedTokens || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
