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
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" aria-label="Workspace Stages">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== `/projects/${projectId}/overview` && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap btn-interactive ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 dark:bg-indigo-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
