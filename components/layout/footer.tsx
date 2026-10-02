"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, X, FileText, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-white dark:bg-slate-950 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-2">
            <Link href="/" className="group btn-interactive inline-block">
              <Logo size="md" className="group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              AI product engineering & audit workspace for vibe coders. Reduce blind spots before you ship.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400">All AI Agent Engines Operational</span>
            </div>
          </div>

          {/* Links Column 1: Product Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Workspace
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <Link href="/projects" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  AI Workspaces
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  New Project Wizard
                </Link>
              </li>
              <li>
                <Link href="/audits" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Website Audits
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Platform Application Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <Link href="/login" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Workspace Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal & Trust
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => setModalType("privacy")}
                  className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400 text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setModalType("terms")}
                  className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400 text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; 2026 Aigenstra. All rights reserved. Build with an AI product team of specialized agents.
          </p>

          <div className="flex space-x-6 text-xs text-slate-400">
            <Link href="https://github.com/Chriseke234/sitelens" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">
              GitHub Repository
            </Link>
            <Link href="/signup" className="transition-colors hover:text-blue-400 font-bold text-blue-400">
              Get Started Free &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Privacy Policy / Terms of Service */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  {modalType === "privacy" ? "Privacy Policy" : "Terms of Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              {modalType === "privacy" ? (
                <>
                  <p>
                    <strong>Aigenstra Data Privacy Commitment:</strong> We are dedicated to respecting your privacy and protecting the security of your product specifications and project code audit data.
                  </p>
                  <p>
                    1. <strong>Project Data Protection:</strong> Project details and code submissions are treated as untrusted data and strictly scoped to your authenticated account using Supabase Row-Level Security (RLS).
                  </p>
                  <p>
                    2. <strong>No Third-Party Data Selling:</strong> Your personal information, user email addresses, and private audit histories are never sold or rented to third-party advertisers.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Aigenstra Terms of Service:</strong> Welcome to Aigenstra. By accessing or using our platform, you agree to comply with the following terms:
                  </p>
                  <p>
                    1. <strong>Defensive Engineering Tool:</strong> Aigenstra provides AI product engineering and audit recommendations to reduce blind spots. It does not guarantee zero vulnerabilities or complete security.
                  </p>
                  <p>
                    2. <strong>User Responsibility:</strong> You retain complete control over external implementation, pull request merges, and deployments.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 btn-interactive"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
