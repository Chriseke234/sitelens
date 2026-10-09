import React from "react";
import { Lightbulb, Network, FileText, Terminal, SearchCheck, CheckCircle2 } from "lucide-react";

export function NeoCapabilities() {
  const capabilities = [
    {
      number: "01",
      title: "UNDERSTAND",
      summary: "Tell Aigenstra what you're trying to build.",
      detail:
        "Input your raw idea, napkin sketch, or existing repository. Aigenstra immediately extracts intent, target personas, and scope boundaries.",
      icon: Lightbulb,
      tagBg: "bg-[#FFE500]",
    },
    {
      number: "02",
      title: "STRUCTURE",
      summary: "Turn the idea into requirements, user flows and product decisions.",
      detail:
        "Transforms abstract thoughts into detailed user stories, step-by-step onboarding journeys, and explicit business logic definitions.",
      icon: Network,
      tagBg: "bg-[#FF4F9A]",
      tagText: "text-white",
    },
    {
      number: "03",
      title: "PLAN",
      summary: "Identify architecture, UX, backend, security and implementation requirements.",
      detail:
        "Maps out frontend component trees, Supabase database schemas, Row-Level Security guardrails, and third-party API contracts.",
      icon: FileText,
      tagBg: "bg-[#B7FF6A]",
    },
    {
      number: "04",
      title: "PROMPT",
      summary: "Generate focused, contextual instructions for your AI coding agent.",
      detail:
        "Outputs surgical, task-by-task prompts containing exact file paths, explicit 'DO NOT MODIFY' boundaries, and strict acceptance criteria.",
      icon: Terminal,
      tagBg: "bg-[#080808]",
      tagText: "text-[#FFE500]",
    },
    {
      number: "05",
      title: "AUDIT",
      summary: "Review what has actually been built.",
      detail:
        "Scrutinizes your live build across UX consistency, mobile responsiveness, accessibility, performance, and security posture.",
      icon: SearchCheck,
      tagBg: "bg-white",
    },
    {
      number: "06",
      title: "VERIFY",
      summary: "Find issues, generate fixes and determine whether the product is ready to ship.",
      detail:
        "Pinpoints regressions, generates corrective fix prompts for your coding agent, and gives you an objective readiness scorecard to ship.",
      icon: CheckCircle2,
      tagBg: "bg-[#B7FF6A]",
    },
  ];

  return (
    <section id="capabilities" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            CORE ARCHITECTURE
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            FROM IDEA <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              TO IMPLEMENTATION.
            </span>
          </h2>
          <p className="mt-6 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            Aigenstra helps you think through your product before asking an AI coding agent to build it.
            One intelligent guide that keeps your vision coherent from day one to launch.
          </p>
        </div>

        {/* 6 Neo-Brutalist Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#080808]"
              >
                <div>
                  {/* Card Header with Number & Tag */}
                  <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3">
                    <span
                      className={`border-2 border-[#080808] px-2 py-0.5 font-mono text-xs font-black uppercase ${item.tagBg} ${
                        item.tagText || "text-[#080808]"
                      }`}
                    >
                      {item.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-[#080808] bg-[#F8F6EC] text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="mt-4 font-mono text-xl font-black uppercase text-[#080808]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-black text-[#080808] font-mono leading-snug">
                    {item.summary}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#080808]/80 font-sans font-medium">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-6 border-t border-dashed border-[#080808]/30 pt-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#080808]/70">
                  Step {item.number} of 06
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
