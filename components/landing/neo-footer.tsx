"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, X, FileText, ArrowRight } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

export function NeoFooter() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | "about" | "contact" | null>(null);

  return (
    <footer className="border-t-[3px] border-[#080808] bg-[#F8F6EC] py-16 text-[#080808]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex items-center justify-center shadow-[3px_3px_0px_#080808]">
                <LogoIcon className="h-10 w-10" />
              </div>
              <span className="font-mono text-2xl font-black uppercase text-[#080808]">
                AIGENSTRA
              </span>
            </Link>

            <p className="font-mono text-xs font-bold leading-relaxed text-[#080808]/80 max-w-sm">
              The thinking layer between your idea and your AI coding agent.
              Plan, structure, prompt, audit, and ship without regression.
            </p>

            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-white px-3 py-1 font-mono text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <span className="h-2 w-2 rounded-full bg-[#B7FF6A] border border-[#080808]" />
              <span>ENGINES OPERATIONAL</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            
            {/* Product */}
            <div>
              <h3 className="font-mono text-xs font-black uppercase text-[#080808] border-b-2 border-[#080808] pb-1">
                PRODUCT
              </h3>
              <ul className="mt-4 space-y-2.5 font-mono text-xs font-bold">
                <li>
                  <Link href="#problem" className="hover:underline">
                    Why Aigenstra
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:underline">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#who-its-for" className="hover:underline">
                    For Builders
                  </Link>
                </li>
                <li>
                  <Link href="#ecosystem" className="hover:underline">
                    Supported Tools
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-mono text-xs font-black uppercase text-[#080808] border-b-2 border-[#080808] pb-1">
                PLATFORM
              </h3>
              <ul className="mt-4 space-y-2.5 font-mono text-xs font-bold">
                <li>
                  <Link href="/projects/new" className="hover:underline">
                    New Project Wizard
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:underline">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:underline">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company & Legal */}
            <div>
              <h3 className="font-mono text-xs font-black uppercase text-[#080808] border-b-2 border-[#080808] pb-1">
                LEGAL &amp; INFO
              </h3>
              <ul className="mt-4 space-y-2.5 font-mono text-xs font-bold">
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("about")}
                    className="hover:underline text-left"
                  >
                    About Aigenstra
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("contact")}
                    className="hover:underline text-left"
                  >
                    Contact Team
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("privacy")}
                    className="hover:underline text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("terms")}
                    className="hover:underline text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t-2 border-[#080808] pt-6 font-mono text-xs sm:flex-row">
          <p className="font-bold text-[#080808]/70">
            &copy; 2026 Aigenstra. Think before you vibe. All rights reserved.
          </p>

          <div className="flex items-center gap-6 font-bold text-[#080808]">
            <Link
              href="/projects/new"
              className="bg-[#FFE500] border-2 border-[#080808] px-3 py-1 shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Start building →
            </Link>
          </div>
        </div>

      </div>

      {/* Accessible Neo-Brutalist Modal Dialog */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto border-[4px] border-[#080808] bg-[#F8F6EC] p-6 text-[#080808] shadow-[10px_10px_0px_#080808]">
            
            <div className="flex items-center justify-between border-b-[3px] border-[#080808] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="bg-[#FFE500] border border-[#080808] px-2 py-0.5 text-xs font-black uppercase">
                  DOCUMENT
                </span>
                <h3 className="text-lg font-black uppercase">
                  {modalType === "privacy" && "Privacy Policy"}
                  {modalType === "terms" && "Terms of Service"}
                  {modalType === "about" && "About Aigenstra"}
                  {modalType === "contact" && "Contact Us"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="border-2 border-[#080808] bg-white p-1 shadow-[2px_2px_0px_#080808] hover:bg-[#FF4F9A] hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 font-mono text-xs leading-relaxed text-[#080808]/90">
              {modalType === "privacy" && (
                <>
                  <p>
                    <strong>Aigenstra Privacy Principles:</strong> We treat your code, product concepts, and prompt blueprints as strictly confidential.
                  </p>
                  <p>
                    1. <strong>Project Isolation:</strong> All project data is stored in Supabase with strict Row-Level Security (RLS) scoped only to your user ID.
                  </p>
                  <p>
                    2. <strong>No Unapproved Model Training:</strong> Your private product specifications and custom prompts are never sold or used for public foundation model training.
                  </p>
                </>
              )}

              {modalType === "terms" && (
                <>
                  <p>
                    <strong>Terms of Service:</strong>
                  </p>
                  <p>
                    1. <strong>Agentic Guidance:</strong> Aigenstra provides structured build plans, prompt generation, and audit verification to reduce engineering blind spots. Final code deployment remains under developer supervision.
                  </p>
                  <p>
                    2. <strong>Developer Ownership:</strong> All blueprints, schemas, and prompts generated within your account remain 100% your intellectual property.
                  </p>
                </>
              )}

              {modalType === "about" && (
                <>
                  <p>
                    <strong>About Aigenstra:</strong>
                  </p>
                  <p>
                    Aigenstra is the thinking layer between human creators and autonomous AI coding agents. We believe software development in the age of AI should be intentional, resilient, and verifiable.
                  </p>
                  <p>
                    Think before you vibe. Plan before you build. Audit before you ship.
                  </p>
                </>
              )}

              {modalType === "contact" && (
                <>
                  <p>
                    <strong>Get in Touch:</strong>
                  </p>
                  <p>
                    Have questions, feature requests, or partnership inquiries? Reach our engineering team at:
                  </p>
                  <p className="bg-white border-2 border-[#080808] p-3 font-bold text-center">
                    hello@aigenstra.com
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t-2 border-[#080808] pt-4">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="border-2 border-[#080808] bg-[#FFE500] px-5 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
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
