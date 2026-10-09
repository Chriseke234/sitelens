"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Terminal, Sparkles } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

export function NeoNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#080808] bg-[#F8F6EC]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform hover:-translate-y-0.5"
            aria-label="Aigenstra Home"
          >
            <div className="flex items-center justify-center shadow-[3px_3px_0px_#080808] transition-all group-hover:shadow-[1px_1px_0px_#080808]">
              <LogoIcon className="h-11 w-11" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-black tracking-tight text-[#080808]">
                AIGENSTRA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#080808]/70">
                Think Before You Vibe
              </span>
            </div>
          </Link>

          {/* Center/Left Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main Navigation">
            <Link
              href="#capabilities"
              className="text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:text-[#FF4F9A]"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              className="text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:text-[#FF4F9A]"
            >
              How it works
            </Link>
            <Link
              href="#who-its-for"
              className="text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:text-[#FF4F9A]"
            >
              For Vibecoders
            </Link>
            <Link
              href="#blueprint"
              className="text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:text-[#FF4F9A]"
            >
              The Blueprint
            </Link>
            <Link
              href="#pricing"
              className="text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:text-[#FF4F9A]"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Auth & Primary CTA Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="border-2 border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#080808] transition-colors hover:border-[#080808] hover:bg-white"
          >
            Log in
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080808] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span>Start building</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/projects/new"
            className="border-2 border-[#080808] bg-[#FFE500] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#080808] shadow-[2px_2px_0px_#080808]"
          >
            Start →
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center border-2 border-[#080808] bg-white text-[#080808] shadow-[3px_3px_0px_#080808] active:translate-x-[2px] active:translate-y-[2px]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t-[3px] border-[#080808] bg-[#F8F6EC] px-4 py-6 sm:hidden">
          <nav className="flex flex-col space-y-4 font-mono font-bold">
            <Link
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="border-2 border-[#080808] bg-white p-3 text-sm uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="border-2 border-[#080808] bg-white p-3 text-sm uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
            >
              How it works
            </Link>
            <Link
              href="#who-its-for"
              onClick={() => setMobileMenuOpen(false)}
              className="border-2 border-[#080808] bg-white p-3 text-sm uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
            >
              For Vibecoders
            </Link>
            <Link
              href="#blueprint"
              onClick={() => setMobileMenuOpen(false)}
              className="border-2 border-[#080808] bg-white p-3 text-sm uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
            >
              The Blueprint
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="border-2 border-[#080808] bg-white p-3 text-sm uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
            >
              Pricing
            </Link>
            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center border-2 border-[#080808] bg-white p-3 text-center text-sm font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
              >
                Log in
              </Link>
              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] p-3 text-center text-sm font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
              >
                <span>Start building with Aigenstra</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
