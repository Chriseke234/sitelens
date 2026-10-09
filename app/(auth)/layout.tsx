import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F6EC] text-[#080808] selection:bg-[#FFE500] selection:text-[#080808]">
      {/* Neo-Brutalist Auth Top Header */}
      <header className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="transition-transform hover:-translate-y-0.5" aria-label="Aigenstra Home">
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-3 py-1.5 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] transition-all hover:bg-[#FFE500] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Return to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Neo-Brutalist Footer */}
      <footer className="border-t-2 border-[#080808] py-4 text-center font-mono text-xs font-bold text-[#080808]/70">
        &copy; 2026 Aigenstra. Think before you vibe.
      </footer>
    </div>
  );
}
