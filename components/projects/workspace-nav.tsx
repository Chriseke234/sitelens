"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GitFork,
  FileCode2,
  Palette,
  Cpu,
  ShieldAlert,
  Users,
  Terminal,
  SearchCheck,
  Wrench,
  Scale,
  Settings,
} from "lucide-react";

interface ProjectWorkspaceNavProps {
  projectId: string;
}

export function ProjectWorkspaceNav({ projectId }: ProjectWorkspaceNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: `/projects/${projectId}/overview`, icon: LayoutDashboard },
    { name: "Discovery", href: `/projects/${projectId}/discovery`, icon: Compass },
    { name: "Research", href: `/projects/${projectId}/research`, icon: BookOpen },
    { name: "User Journey", href: `/projects/${projectId}/journey`, icon: GitFork },
    { name: "Product", href: `/projects/${projectId}/product`, icon: FileCode2 },
    { name: "Design", href: `/projects/${projectId}/design`, icon: Palette },
    { name: "Architecture", href: `/projects/${projectId}/architecture`, icon: Cpu },
    { name: "Security", href: `/projects/${projectId}/security`, icon: ShieldAlert },
    { name: "Agent Council", href: `/projects/${projectId}/council`, icon: Users },
    { name: "Build Prompts", href: `/projects/[id]/prompts`.replace("[id]", projectId), icon: Terminal },
    { name: "Audit", href: `/projects/${projectId}/audit`, icon: SearchCheck },
    { name: "Fix Queue", href: `/projects/${projectId}/fix-queue`, icon: Wrench },
    { name: "Decisions", href: `/projects/${projectId}/decisions`, icon: Scale },
    { name: "Settings", href: `/projects/${projectId}/settings`, icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap btn-interactive ${
              isActive
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
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
