"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FileCode2,
  Cpu,
  FolderGit2,
  ListTodo,
  BookMarked,
  Terminal,
  SearchCheck,
  ShieldCheck,
  Settings,
} from "lucide-react";

interface ProjectWorkspaceNavProps {
  projectId: string;
}

export function ProjectWorkspaceNav({ projectId }: ProjectWorkspaceNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: `/projects/${projectId}/overview`, icon: LayoutDashboard },
    { name: "Discovery & Q&A", href: `/projects/${projectId}/discovery`, icon: Compass },
    { name: "Software Blueprint", href: `/projects/${projectId}/product`, icon: FileCode2 },
    { name: "Architecture & Security", href: `/projects/${projectId}/architecture`, icon: Cpu },
    { name: "Project Intelligence", href: `/projects/${projectId}/intelligence`, icon: FolderGit2 },
    { name: "Task Planning", href: `/projects/${projectId}/tasks`, icon: ListTodo },
    { name: "Decision Log", href: `/projects/${projectId}/decisions`, icon: BookMarked },
    { name: "Prompt Studio", href: `/projects/${projectId}/prompts`, icon: Terminal },
    { name: "Audit & Fixes", href: `/projects/${projectId}/audit`, icon: SearchCheck },
    { name: "Readiness & Analytics", href: `/projects/${projectId}/readiness`, icon: ShieldCheck },
    { name: "Settings", href: `/projects/${projectId}/settings`, icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono" aria-label="Workspace Stages">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== `/projects/${projectId}/overview` && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase transition-all whitespace-nowrap ${
              isActive
                ? "border-2 border-[#080808] bg-[#FFE500] text-[#080808] shadow-[2.5px_2.5px_0px_#080808] -translate-y-0.5"
                : "border-2 border-transparent text-[#080808]/80 hover:border-[#080808] hover:bg-white hover:text-[#080808] hover:shadow-[2px_2px_0px_#080808]"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
