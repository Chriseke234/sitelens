import React from "react";
import { Terminal, Lightbulb, Users, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export function NeoAudience() {
  const audiences = [
    {
      title: "VIBECODERS",
      tag: "SPEED & FLOW",
      bg: "bg-[#FFE500]",
      description: "Building fast with Cursor, Antigravity, or Claude Code.",
      points: [
        "Give your agent tight context before it codes",
        "Stop burning tokens on hallucinated architecture",
        "Generate 12-section precision prompt blocks",
      ],
      icon: Terminal,
    },
    {
      title: "FOUNDERS & MAKERS",
      tag: "ZERO TO ONE",
      bg: "bg-[#B7FF6A]",
      description: "Have a product idea but need a structured technical roadmap.",
      points: [
        "Answer key questions to capture essential UX flows",
        "Translates ideas into frontend, backend, & database specs",
        "No engineering degree needed — structured guidance",
      ],
      icon: Lightbulb,
    },
    {
      title: "BUILDERS & TEAMS",
      tag: "RELIABLE SHIPPING",
      bg: "bg-white",
      description: "Turn scattered notes into clear, isolated tasks.",
      points: [
        "Align specs, security rules, and user journeys",
        "Audit code before pushing to production",
        "Keep agents constrained to their assigned modules",
      ],
      icon: Users,
    },
  ];

  return (
    <section id="who-its-for" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FF4F9A] px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#080808]">
            WHO IT IS FOR
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            BUILT FOR ANYONE <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              BUILDING WITH AI.
            </span>
          </h2>
          <p className="mt-4 text-sm font-bold text-[#080808]/80 font-mono max-w-xl mx-auto">
            Keep your AI coding agents honest, constrained, and aligned from concept to production.
          </p>
        </div>

        {/* 3 Audience Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <div
                key={aud.title}
                className={`flex flex-col justify-between border-[3px] border-[#080808] ${aud.bg} p-6 sm:p-8 shadow-[6px_6px_0px_#080808] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#080808]`}
              >
                <div>
                  <div className="flex items-center justify-between border-b-2 border-[#080808] pb-4">
                    <span className="border-2 border-[#080808] bg-[#080808] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-white">
                      {aud.tag}
                    </span>
                    <Icon className="h-6 w-6 text-[#080808] stroke-[2.5]" />
                  </div>

                  <h3 className="mt-5 font-mono text-2xl font-black uppercase text-[#080808]">
                    {aud.title}
                  </h3>
                  
                  <p className="mt-2 font-mono text-xs font-bold uppercase text-[#080808]/80">
                    {aud.description}
                  </p>

                  <ul className="mt-6 space-y-3 font-mono text-xs font-medium text-[#080808]">
                    {aud.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 text-[#080808] stroke-[3] mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-[#080808]">
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-[#080808] hover:underline"
                  >
                    <span>Get started as a {aud.title.toLowerCase()}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
