"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  userProfile?: {
    email: string;
    full_name?: string;
  };
}

export function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Audits", href: "/audits", icon: FileCheck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setSigningOut(false);
    }
  };

  const displayName = userProfile?.full_name || "User Account";
  const displayEmail = userProfile?.email || "";

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-[3px] border-[#080808] bg-[#F8F6EC] px-4 lg:hidden">
        <Link href="/dashboard" className="transition-transform hover:-translate-y-0.5">
          <Logo size="md" />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="border-2 border-[#080808] bg-white p-2 text-[#080808] shadow-[2px_2px_0px_#080808] active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#080808]/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-[3px] border-[#080808] bg-[#F8F6EC] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center px-6 border-b-[3px] border-[#080808]">
          <Link href="/dashboard" className="transition-transform hover:-translate-y-0.5">
            <Logo size="md" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 px-4 py-6 font-mono text-xs">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 border-2 px-3.5 py-3 font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? "border-[#080808] bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] translate-x-0.5"
                    : "border-transparent text-[#080808] hover:border-[#080808] hover:bg-white hover:shadow-[3px_3px_0px_#080808]"
                }`}
              >
                <Icon className="h-4 w-4 stroke-[2.5]" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Profile Summary & Sign Out */}
        <div className="border-t-[3px] border-[#080808] p-4 bg-white/50">
          <div className="mb-3 flex items-center gap-3 border-2 border-[#080808] bg-white p-2.5 shadow-[2px_2px_0px_#080808]">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#080808] bg-[#B7FF6A] text-[#080808]">
              <UserIcon className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col truncate font-mono">
              <span className="truncate text-xs font-black uppercase text-[#080808]">
                {displayName}
              </span>
              <span className="truncate text-[10px] font-bold text-[#080808]/60">
                {displayEmail}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#080808] bg-white py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] transition-all hover:bg-red-50 hover:text-red-700 active:translate-x-0.5 active:translate-y-0.5"
          >
            <LogOut className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
