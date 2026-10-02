import React from "react";
import { LogoIcon } from "@/components/ui/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white selection:bg-cyan-500 selection:text-white px-4">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-500/15 via-indigo-500/20 to-purple-500/15 blur-3xl rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm w-full">
        {/* Animated Glowing Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing outer aura ring */}
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-30 blur-lg animate-pulse" />

          {/* Core Cybernetic Logo Icon */}
          <div className="relative flex items-center justify-center p-3 rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            <LogoIcon className="h-14 w-14 sm:h-16 sm:w-16 animate-[pulse_2.2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          </div>
        </div>

        {/* Text and status */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-sans">
              Aigenstra
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Preparing AI Engineering Workspace...
          </p>
        </div>

        {/* Sleek loading shimmer progress bar */}
        <div className="w-44 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full w-2/3 animate-[shimmer_1.5s_infinite_linear] -translate-x-full" />
        </div>
      </div>
    </div>
  );
}
