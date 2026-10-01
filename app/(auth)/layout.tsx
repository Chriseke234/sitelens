import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header logo */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 p-1">
              <img src="/aigenstra-logo.png" alt="Aigenstra Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Aigenstra</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Return to homepage
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs text-slate-400">
        &copy; 2026 Aigenstra. All rights reserved.
      </footer>
    </div>
  );
}
