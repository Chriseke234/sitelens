"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FileCode2,
  Terminal,
  SearchCheck,
  Rocket,
  Settings,
  ChevronRight,
} from "lucide-react";

interface ProjectWorkspaceNavProps {
  projectId: string;
}

export function ProjectWorkspaceNav({ projectId }: ProjectWorkspaceNavProps) {
  const pathname = usePathname();

  const stages = [
    {
      id: "overview",
      step: "HUB",
      name: "Overview",
      href: `/projects/${projectId}/overview`,
      icon: LayoutDashboard,
      match: (path: string) => path === `/projects/${projectId}/overview` || path === `/projects/${projectId}`,
    },
    {
      id: "understand",
      step: "01",
      name: "Understand",
      subtitle: "Discovery & Scope",
      href: `/projects/${projectId}/discovery`,
      icon: Compass,
      match: (path: string) => path.startsWith(`/projects/${projectId}/discovery`),
    },
    {
      id: "blueprint",
      step: "02",
      name: "Blueprint",
      subtitle: "Specs & Arch",
      href: `/projects/${projectId}/product`,
      icon: FileCode2,
      match: (path: string) =>
        path.startsWith(`/projects/${projectId}/product`) ||
        path.startsWith(`/projects/${projectId}/architecture`) ||
        path.startsWith(`/projects/${projectId}/intelligence`) ||
        path.startsWith(`/projects/${projectId}/decisions`),
    },
    {
      id: "prompts",
      step: "03",
      name: "Prompts",
      subtitle: "Agent Studio",
      href: `/projects/${projectId}/prompts`,
      icon: Terminal,
      match: (path: string) =>
        path.startsWith(`/projects/${projectId}/prompts`) ||
        path.startsWith(`/projects/${projectId}/tasks`),
    },
    {
      id: "audit",
      step: "04",
      name: "Audit & Fixes",
      subtitle: "Verify Code",
      href: `/projects/${projectId}/audit`,
      icon: SearchCheck,
      match: (path: string) =>
        path.startsWith(`/projects/${projectId}/audit`) ||
        path.startsWith(`/projects/${projectId}/fix-queue`),
    },
    {
      id: "ship",
      step: "05",
      name: "Ship",
      subtitle: "Readiness Check",
      href: `/projects/${projectId}/readiness`,
      icon: Rocket,
      match: (path: string) => path.startsWith(`/projects/${projectId}/readiness`),
    },
  ];

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none" aria-label="5 Bento Stages">
        <nav className="flex items-center gap-2">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = stage.match(pathname || "");

            return (
              <Link
                key={stage.id}
                href={stage.href}
                className={`group flex items-center gap-2 border-[2.5px] border-[#080808] px-3.5 py-2 text-xs font-black uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                    : "bg-white text-[#080808] hover:bg-[#F8F6EC] hover:shadow-[2px_2px_0px_#080808]"
                }`}
              >
                <span
                  className={`border border-[#080808] px-1 py-0.2 text-[9px] font-black ${
                    isActive ? "bg-[#080808] text-[#FFE500]" : "bg-[#F8F6EC] text-[#080808]"
                  }`}
                >
                  {stage.step}
                </span>
                <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
                <span>{stage.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Unobtrusive Settings Link */}
        <Link
          href={`/projects/${projectId}/settings`}
          className={`flex items-center gap-1.5 border-[2px] border-[#080808] px-3 py-2 text-xs font-bold uppercase transition-all shrink-0 ${
            pathname?.startsWith(`/projects/${projectId}/settings`)
              ? "bg-[#FF4F9A] text-white shadow-[2.5px_2.5px_0px_#080808]"
              : "bg-white text-[#080808]/70 hover:bg-[#F8F6EC] hover:text-[#080808]"
          }`}
        >
          <Settings className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </div>
    </div>
  );
}
