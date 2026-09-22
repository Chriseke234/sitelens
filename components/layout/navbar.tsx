"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
      <div className="flex h-14 items-center justify-between rounded-full border border-slate-200/90 bg-white/90 px-4 sm:px-6 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-slate-950/50">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white group btn-interactive">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Search className="h-4 w-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight font-sans">SiteLens</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-1 md:flex">
          <Link
            href="#capabilities"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Product
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            How it works
          </Link>
          <Link
            href="#media-proof"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Media Proof
          </Link>
          <Link
            href="#reports"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Resources
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center space-x-2 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="rounded-full px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 btn-interactive">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 gap-1.5 btn-interactive">
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">Toggle navigation menu</span>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden animate-fade-in">
          <div className="flex flex-col space-y-2">
            <Link
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              How it works
            </Link>
            <Link
              href="#media-proof"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Media Proof
            </Link>
            <Link
              href="#reports"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Resources
            </Link>
            <div className="pt-2 flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center rounded-full text-xs font-bold btn-interactive">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-600/20 gap-1.5 btn-interactive">
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
