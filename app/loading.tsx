import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white selection:bg-cyan-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/15 to-purple-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Glowing Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-40 blur-md animate-pulse" />
          
          {/* Logo container with sleek border */}
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 p-2 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            <Image
              src="/aigenstra-logo.png"
              alt="Aigenstra Logo"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-md animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
              priority
            />
          </div>
        </div>

        {/* Text and status */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Aigenstra
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
            Preparing AI Engineering Workspace...
          </p>
        </div>

        {/* Sleek loading bar */}
        <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full w-1/2 animate-[shimmer_1.5s_infinite_linear] -translate-x-full" />
        </div>
      </div>
    </div>
  );
}
