"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Trash2,
  Compass,
  ArrowRight,
  Bot,
  RefreshCw,
  Cpu,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  Project,
  AigenstraTask,
  CompiledPrompt,
  CodingAgentProfile,
  SoftwareBlueprint,
} from "@/types";
import { DeleteProjectModal } from "./delete-project-modal";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface UnifiedStudioViewProps {
  project: Project;
  initialTasks?: AigenstraTask[];
  initialPrompt?: CompiledPrompt | null;
}

export function UnifiedStudioView({
  project,
  initialTasks = [],
  initialPrompt = null,
}: UnifiedStudioViewProps) {
  const router = useRouter();

  // Mode: "chat" (Conversational Clarification like ChatGPT) or "prompts" (Split Studio like Lovable/Cursor)
  const [activeMode, setActiveMode] = useState<"chat" | "prompts">("chat");

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Tasks & Prompts State
  const [tasks, setTasks] = useState<AigenstraTask[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTasks[0]?.id || null
  );
  const [selectedAgent, setSelectedAgent] = useState<CodingAgentProfile>(
    (project.coding_environment as CodingAgentProfile) || "Antigravity"
  );
  const [activePrompt, setActivePrompt] = useState<CompiledPrompt | null>(initialPrompt);
  const [isCompiling, setIsCompiling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWithDirectives, setCopiedWithDirectives] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Initial Load: Fetch questions & synthesize chat conversation
  useEffect(() => {
    loadChatAndTasks();
  }, [project.id]);

  const loadChatAndTasks = async () => {
    try {
      // 1. Fetch discovery questions
      const discRes = await fetch(`/api/projects/${project.id}/discovery`);
      const discData = await discRes.json();

      const qnaList = discData?.qnaList || [];
      const initMessages: Message[] = [];

      // Initial assistant greeting
      initMessages.push({
        id: "msg_intro",
        sender: "assistant",
        text: `Hey! I'm your AI Product Copilot for **${project.name}**.\n\nYou described your idea as:\n> "${project.raw_idea || project.description || "Building a high-quality product"}"\n\nTo lock down your exact database schema, UI wireframe, and build prompts with zero guesswork, let's clarify your core decisions below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      // Populate QnA as conversation history
      qnaList.forEach((q: any, idx: number) => {
        initMessages.push({
          id: `q_${q.id}`,
          sender: "assistant",
          text: `**Decision ${idx + 1}**: ${q.question}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        if (q.answer && q.answer.trim()) {
          initMessages.push({
            id: `a_${q.id}`,
            sender: "user",
            text: q.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
      });

      setMessages(initMessages);
      setChatInitialized(true);

      // 2. Fetch Tasks if available
      const tasksRes = await fetch(`/api/projects/${project.id}/tasks`);
      const tasksData = await tasksRes.json();
      if (tasksRes.ok && Array.isArray(tasksData.tasks) && tasksData.tasks.length > 0) {
        setTasks(tasksData.tasks);
        setSelectedTaskId(tasksData.tasks[0].id);
        await compilePrompt(tasksData.tasks[0], selectedAgent);
      }
    } catch (err) {
      console.error("Failed to load initial studio data:", err);
    }
  };

  const compilePrompt = async (targetTask: AigenstraTask, agent: CodingAgentProfile) => {
    setIsCompiling(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/tasks/${targetTask.id}/prompt`, {
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
      }
    } catch (err) {
      console.error("Failed to compile prompt:", err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue.trim();
    setInputValue("");
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      // Find the first unanswered question to save in Supabase
      const discRes = await fetch(`/api/projects/${project.id}/discovery`);
      const discData = await discRes.json();
      const unanswered = (discData?.qnaList || []).find((q: any) => !q.answer || !q.answer.trim());

      if (unanswered) {
        await fetch(`/api/projects/${project.id}/discovery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qnaId: unanswered.id,
            answer: userText,
          }),
        });
      }

      // Synthesize tasks on the fly
      const tasksRes = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const tasksData = await tasksRes.json();

      let taskCount = 0;
      if (tasksRes.ok && Array.isArray(tasksData.tasks) && tasksData.tasks.length > 0) {
        setTasks(tasksData.tasks);
        setSelectedTaskId(tasksData.tasks[0].id);
        taskCount = tasksData.tasks.length;
        await compilePrompt(tasksData.tasks[0], selectedAgent);
      }

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        sender: "assistant",
        text: `Got it! I've locked this into your product architecture.\n\n${
          taskCount > 0
            ? `I formulated **${taskCount} verified build tasks** with exact file boundaries and UI wireframes. Click **"View Agent Prompts →"** above or below to copy the code generation prompt.`
            : `What is the primary user action or database entity you'd like to implement first?`
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Message submission error:", err);
    } finally {
      setIsSending(false);
    }
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
    const blob = new Blob([activePrompt.markdownText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activePrompt.taskTitle || "PROMPT").toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null;

  return (
    <div className="space-y-6 font-mono text-[#080808]">
      {/* Top Banner: Project Title, Mode Switcher (Chat vs Prompt Studio), Delete Action */}
      <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                UNIFIED AI STUDIO
              </span>
              <span className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} Ready
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808]">
              {project.name}
            </h1>
            <p className="text-xs font-medium text-[#080808]/75 line-clamp-1 max-w-2xl">
              {project.raw_idea || project.description || "Real-time AI Product Engineering"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher Tabs */}
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
                <span>1. Idea & Architecture Chat</span>
              </button>

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
            </div>

            {/* Delete Project Modal */}
            <DeleteProjectModal
              projectId={project.id}
              projectName={project.name}
              variant="header"
            />
          </div>
        </div>
      </div>

      {/* VIEW A: Conversational Copilot (ChatGPT style) */}
      {activeMode === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chat Stream */}
          <div className="lg:col-span-8 flex flex-col border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808] h-[650px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b-[3px] border-[#080808] bg-[#F8F6EC] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center border-2 border-[#080808] bg-[#FFE500] shadow-[1.5px_1.5px_0px_#080808]">
                  <Bot className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-[#080808]">
                    AI Architecture Copilot
                  </div>
                  <div className="text-[10px] font-bold text-[#080808]/60">
                    Grounding your prompts in real user decisions (Zero Hallucinations)
                  </div>
                </div>
              </div>

              {tasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveMode("prompts")}
                  className="flex items-center gap-1.5 border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1.5 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <span>Open Prompts ({tasks.length}) →</span>
                </button>
              )}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
              {messages.map((m) => {
                const isAssistant = m.sender === "assistant";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-[#080808]/60">
                        {isAssistant ? "Aigenstra AI" : "You"}
                      </span>
                      <span className="text-[9px] text-[#080808]/40">{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] border-2 border-[#080808] p-4 text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-[3px_3px_0px_#080808] ${
                        isAssistant
                          ? "bg-[#F8F6EC] text-[#080808]"
                          : "bg-[#FFE500] text-[#080808]"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 border-2 border-[#080808] bg-[#F8F6EC] p-3 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] w-fit">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing architecture & compiling prompt tasks...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="border-t-[3px] border-[#080808] bg-[#F8F6EC] p-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Answer the question or describe what you want built..."
                className="flex-1 border-2 border-[#080808] bg-white px-4 py-2.5 text-xs font-mono font-medium text-[#080808] shadow-[2px_2px_0px_#080808] placeholder:text-[#080808]/40 focus:outline-none focus:ring-0"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] disabled:opacity-50 transition-all"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary Sidebar: Real Live Scope */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                  <Compass className="h-4 w-4 stroke-[2.5]" />
                  <span>Live Project Scope</span>
                </div>
                <span className="border border-[#080808] bg-[#FFE500] px-2 py-0.5 text-[9px] font-black uppercase">
                  {project.coding_environment}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="border border-[#080808] bg-[#F8F6EC] p-3 space-y-1">
                  <div className="text-[10px] font-black uppercase text-[#080808]/60">
                    Target Tech Stack
                  </div>
                  <div className="font-black text-[#080808]">
                    {project.tech_stack || "Next.js 15, Supabase, Tailwind CSS"}
                  </div>
                </div>

                <div className="border border-[#080808] bg-[#F8F6EC] p-3 space-y-1">
                  <div className="text-[10px] font-black uppercase text-[#080808]/60">
                    Product Objective
                  </div>
                  <div className="font-medium text-[#080808]/80 leading-relaxed">
                    {project.goal || project.description}
                  </div>
                </div>

                <div className="border border-[#080808] bg-[#B7FF6A]/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#080808]">
                      Generated Tasks
                    </span>
                    <span className="font-black text-[#080808]">{tasks.length}</span>
                  </div>
                  {tasks.slice(0, 3).map((t, idx) => (
                    <div
                      key={t.id}
                      className="border border-[#080808] bg-white p-2 text-[11px] font-bold text-[#080808] flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px]">
                        {idx + 1}. {t.title}
                      </span>
                      <span className="text-[9px] font-black uppercase bg-[#FFE500] px-1">
                        {t.complexity || "MED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {tasks.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveMode("prompts")}
                  className="w-full inline-flex items-center justify-center gap-2 border-[2.5px] border-[#080808] bg-[#FFE500] py-3 text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] transition-all"
                >
                  <Terminal className="h-4 w-4 stroke-[2.5]" />
                  <span>View Ready Prompts ({tasks.length}) →</span>
                </button>
              ) : (
                <div className="text-center text-[11px] text-[#080808]/70 border border-dashed border-[#080808] p-3 bg-[#F8F6EC]">
                  Answer the questions on the left to compile your prompts.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: Split Studio (Cursor Composer & Lovable style) */}
      {activeMode === "prompts" && (
        <div className="space-y-6">
          {/* Target Agent Selector Bento Bar */}
          <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[5px_5px_0px_#080808]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                <span className="text-xs font-black uppercase text-[#080808]">
                  Coding Agent Profile:
                </span>
                <span className="border border-[#080808] bg-[#FFE500] px-2 py-0.5 text-xs font-black uppercase text-[#080808]">
                  {selectedAgent}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(["Antigravity", "Claude Code", "Cursor", "Codex"] as CodingAgentProfile[]).map(
                  (ag) => (
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
                  )
                )}
              </div>
            </div>
          </div>

          {/* Task Selector Bar */}
          {tasks.length > 0 && (
            <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#080808] hover:text-[#FFE500] transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 stroke-[2.5]" /> Copy Prompt
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPrompt}
                  className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-3 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#F8F6EC]"
                >
                  <Download className="h-3.5 w-3.5 stroke-[2.5]" /> .md
                </button>
              </div>
            </div>
          )}

          {/* Split Pane: Left = Wireframe Preview Card; Right = Prompt Code Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Visual Wireframe Mockup (Lovable style) */}
            <div className="lg:col-span-5 flex flex-col justify-between border-[3px] border-[#080808] bg-white p-5 shadow-[6px_6px_0px_#080808] space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                    <span className="text-xs font-black uppercase text-[#080808]">
                      What You Are Building
                    </span>
                  </div>
                  <span className="border border-[#080808] bg-[#B7FF6A] px-1.5 py-0.2 text-[9px] font-black uppercase">
                    Wireframe Mockup
                  </span>
                </div>

                {/* Mock Browser/App Canvas */}
                <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2.5px_2.5px_0px_#080808] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#080808] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full border border-[#080808] bg-[#FF4F9A]" />
                      <span className="h-2 w-2 rounded-full border border-[#080808] bg-[#FFE500]" />
                      <span className="h-2 w-2 rounded-full border border-[#080808] bg-[#B7FF6A]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#080808]/70 truncate max-w-[180px]">
                      {currentTask?.affected_screens?.[0] || "/dashboard/feature"}
                    </span>
                  </div>

                  <div className="border border-[#080808] bg-white p-3 space-y-2">
                    <div className="text-xs font-black uppercase text-[#080808]">
                      {currentTask?.title || "Feature Implementation"}
                    </div>
                    <p className="text-[11px] font-medium text-[#080808]/80 leading-relaxed bg-[#F8F6EC] p-2 border border-[#080808]">
                      {currentTask?.purpose || currentTask?.short_description || "Target feature scope"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="border border-[#080808] bg-white p-2">
                      <span className="text-[#080808]/60 block font-bold">ROUTE</span>
                      <span className="font-black text-[#080808] truncate block">
                        {currentTask?.affected_screens?.[0] || "/app"}
                      </span>
                    </div>
                    <div className="border border-[#080808] bg-white p-2">
                      <span className="text-[#080808]/60 block font-bold">SCHEMA</span>
                      <span className="font-black text-[#080808] truncate block">
                        {currentTask?.affected_entities?.[0] || "Supabase"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Outcome & Boundaries */}
              <div className="space-y-3 pt-2 border-t-2 border-[#080808]">
                <div className="border-2 border-[#080808] bg-[#FFE500]/20 p-3 text-xs">
                  <span className="font-black uppercase block mb-1">User Outcome:</span>
                  <p className="font-medium text-[#080808]/85">
                    {currentTask?.user_value || "Delivers end-user functionality without broken dependencies."}
                  </p>
                </div>

                <div className="border-2 border-[#080808] bg-white p-3 text-[11px] space-y-1">
                  <div>
                    <strong>MUST CHANGE:</strong>{" "}
                    {currentTask?.change_boundaries?.mustChange?.slice(0, 2).join(", ") || "app/, components/"}
                  </div>
                  <div>
                    <strong>LEAVE ALONE:</strong>{" "}
                    {currentTask?.change_boundaries?.mustNotChange?.slice(0, 1).join(", ") || "middleware.ts, auth config"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor & Markdown Prompt (Cursor style) */}
            <div className="lg:col-span-7 border-[3px] border-[#080808] bg-[#080808] shadow-[6px_6px_0px_#080808] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] bg-[#141414] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#FFE500]" />
                  <span className="text-xs font-mono font-bold text-[#FFE500]">
                    {selectedAgent.toUpperCase()}_PROMPT.md
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 border border-[#FFE500] bg-[#FFE500] px-3 py-1 text-xs font-black uppercase text-[#080808] hover:bg-white transition-all"
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

              <div className="p-4 flex-1">
                {isCompiling ? (
                  <div className="flex items-center justify-center h-64 text-green-400 font-mono text-xs gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Compiling precision prompt...
                  </div>
                ) : activePrompt ? (
                  <pre className="max-h-[500px] overflow-auto font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
                    {activePrompt.markdownText}
                  </pre>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-12">
                    Select or generate a task to view its compiled prompt.
                  </div>
                )}
              </div>

              <div className="border-t-2 border-[#1a1a1a] bg-[#141414] px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Tailored for {selectedAgent}</span>
                <span>Optimized Tokens: ~{activePrompt?.optimization.optimizedEstimatedTokens || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
