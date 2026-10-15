"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Terminal,
  SearchCheck,
  Settings,
} from "lucide-react";

interface ProjectWorkspaceNavProps {
  projectId: string;
}

export function ProjectWorkspaceNav({ projectId }: ProjectWorkspaceNavProps) {
  const pathname = usePathname();

  const isAudit = pathname?.includes("/audit") || pathname?.includes("/fix-queue") || pathname?.includes("/report");
  const isSettings = pathname?.includes("/settings");
  const isStudio = !isAudit && !isSettings;

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1" aria-label="Studio Navigation">
        <nav className="flex items-center gap-2">
          {/* Main Unified Studio Tab */}
          <Link
            href={`/projects/${projectId}`}
            className={`group flex items-center gap-2 border-[2.5px] border-[#080808] px-4 py-2 text-xs font-black uppercase transition-all whitespace-nowrap ${
              isStudio
                ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                : "bg-white text-[#080808] hover:bg-[#F8F6EC] hover:shadow-[2px_2px_0px_#080808]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            <span>AI Product & Prompt Studio</span>
          </Link>

          {/* Audit & QA Tab */}
          <Link
            href={`/projects/${projectId}/audit`}
            className={`group flex items-center gap-2 border-[2.5px] border-[#080808] px-4 py-2 text-xs font-black uppercase transition-all whitespace-nowrap ${
              isAudit
                ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                : "bg-white text-[#080808] hover:bg-[#F8F6EC] hover:shadow-[2px_2px_0px_#080808]"
            }`}
          >
            <SearchCheck className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            <span>Code Audit & Verification</span>
          </Link>
        </nav>

        {/* Settings Tab */}
        <Link
          href={`/projects/${projectId}/settings`}
          className={`flex items-center gap-1.5 border-[2px] border-[#080808] px-3 py-2 text-xs font-bold uppercase transition-all shrink-0 ${
            isSettings
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
