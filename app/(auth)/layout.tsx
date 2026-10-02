import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
          <Link href="/" className="btn-interactive">
            <Logo size="md" />
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
