"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, X, FileText, ArrowRight } from "lucide-react";

export function Footer() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-white dark:bg-slate-950 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-white group btn-interactive">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight font-sans">SiteLens</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Evidence-based website auditing and digital media provenance verification in one workspace.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400">All audit engines operational</span>
            </div>
          </div>

          {/* Links Column 1: Product Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <Link href="#capabilities" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Audit Capabilities
                </Link>
              </li>
              <li>
                <Link href="#media-proof" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Media Provenance
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#reports" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  AI Reports
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
              <li>
                <Link href="/audits" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Website Audits
                </Link>
              </li>
              <li>
                <Link href="/media" className="inline-block text-xs text-slate-400 transition-all hover:translate-x-1 hover:text-blue-400">
                  Media Authenticity
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
            &copy; 2026 SiteLens. All rights reserved. Built for evidence-first website & media intelligence.
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
                    <strong>SiteLens Data Privacy Commitment:</strong> We are dedicated to respecting your privacy and protecting the security of your website and media audit data.
                  </p>
                  <p>
                    1. <strong>Audit Data Usage:</strong> Website URLs submitted for audit are processed strictly to calculate technical SEO, performance, accessibility, UX, trust, and conversion metrics.
                  </p>
                  <p>
                    2. <strong>Media Provenance Storage:</strong> Uploaded media files are stored securely in isolated Supabase storage buckets protected by strict Row-Level Security (RLS) policies.
                  </p>
                  <p>
                    3. <strong>No Third-Party Data Selling:</strong> Your personal information, user email addresses, and private audit histories are never sold or rented to third-party advertisers.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>SiteLens Pre-Launch Terms of Service:</strong> Welcome to SiteLens. By accessing or using our platform, you agree to comply with the following terms:
                  </p>
                  <p>
                    1. <strong>Pre-Launch Free Access:</strong> During pre-launch testing, SiteLens provides website intelligence and media authenticity auditing free of charge. No payment details are required.
                  </p>
                  <p>
                    2. <strong>Authorized Scanning:</strong> You agree to submit website URLs and media files only for authorized testing, diagnostic, or evaluation purposes.
                  </p>
                  <p>
                    3. <strong>Evidence-Grounded Intelligence:</strong> Audit reports and media authenticity scores are generated deterministically based on empirical HTML, EXIF metadata, and forensic evidence signals.
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
