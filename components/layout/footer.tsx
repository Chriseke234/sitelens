import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <Search className="h-3.5 w-3.5" />
              </div>
              <span className="text-base tracking-tight">SiteLens</span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Website intelligence and digital media analysis.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="#capabilities" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Audit Capabilities
                </Link>
              </li>
              <li>
                <Link href="#media-proof" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Media Provenance
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Resources
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="#reports" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Actionable Reports
                </Link>
              </li>
              <li>
                <Link href="#audience" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Use Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal & Trust
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="#" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; 2026 SiteLens. All rights reserved.
          </p>

          <div className="flex space-x-6 text-xs text-slate-400">
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">
              Twitter / X
            </Link>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">
              GitHub
            </Link>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
