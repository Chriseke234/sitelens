import React from "react";
import { Terminal, Cpu, Sparkles, Layers, Box, Code2, ArrowUpRight } from "lucide-react";

export function NeoEcosystem() {
  const tools = [
    {
      name: "Google Antigravity",
      role: "Agentic pair programmer & CLI",
      tag: "Agent",
    },
    {
      name: "Claude Code",
      role: "Terminal coding assistant",
      tag: "CLI",
    },
    {
      name: "Codex",
      role: "Autonomous code generation",
      tag: "Agent",
    },
    {
      name: "Lovable",
      role: "Fullstack web app builder",
      tag: "Builder",
    },
    {
      name: "Replit Agent",
      role: "Cloud IDE & deployment agent",
      tag: "Environment",
    },
    {
      name: "Cursor / VS Code",
      role: "AI-enhanced editor workflows",
      tag: "Editor",
    },
  ];

  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            TOOL AGNOSTIC
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            WORKS WITH <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              YOUR WORKFLOW.
            </span>
          </h2>
          <p className="mt-4 font-mono text-xs font-black uppercase tracking-wider text-[#080808]">
            Designed for AI-assisted development workflows.
          </p>
          <p className="mt-4 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            Take structured blueprints and copy surgical prompts straight into whatever tool or agent you use to write code.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className="flex items-center justify-between border-[3px] border-[#080808] bg-white p-5 shadow-[4px_4px_0px_#080808] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#080808]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black uppercase text-[#080808]">
                    {t.name}
                  </span>
                  <span className="border border-[#080808] bg-[#FFE500] px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-[#080808]">
                    {t.tag}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-[#080808]/70">
                  {t.role}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center border-2 border-[#080808] bg-[#F8F6EC] text-[#080808]">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div className="mt-10 border-2 border-[#080808] bg-white p-4 font-mono text-xs font-bold text-center text-[#080808] max-w-2xl mx-auto shadow-[3px_3px_0px_#080808]">
          Supports all prompt-driven and agentic coding platforms via structured context export and clipboard injection.
        </div>

      </div>
    </section>
  );
}
