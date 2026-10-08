"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Users,
  Layout,
  Database,
  ShieldCheck,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
} from "lucide-react";
import { BlueprintSkeleton } from "@/types";

interface BlueprintSkeletonViewProps {
  skeleton: BlueprintSkeleton;
}

export function BlueprintSkeletonView({ skeleton }: BlueprintSkeletonViewProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileCode2 className="h-3.5 w-3.5" />
            Software Blueprint (Preliminary Skeleton)
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {skeleton.productOverview.name} Blueprint
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {skeleton.productOverview.purpose}
          </p>
        </div>

        {/* Technical toggle */}
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>{showTechnical ? "Hide Technical Details" : "View Technical Details"}</span>
          {showTechnical ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 1. Target Experiences */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          User Experiences
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {skeleton.experiences.map((exp, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {exp.userRole} Experience
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Goal:</span> {exp.coreGoal}
              </p>
              <p className="mt-1 text-slate-500 text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-400">Workflow:</span> {exp.keyWorkflow}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Planned Screens & Views */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <Layout className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Planned Screens & Interfaces
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {skeleton.screens.map((screen, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="font-bold text-slate-900 dark:text-white">
                {screen.name}
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {screen.purpose}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Expandable Technical Architecture Details */}
      {showTechnical && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
          {/* Data Entities */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-950/50 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-3">
              <Database className="h-4 w-4" />
              Database Entities & Ownership
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skeleton.dataEntities.map((ent, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-indigo-200 bg-white p-3.5 text-xs dark:border-indigo-900/60 dark:bg-slate-900"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {ent.name}
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    {ent.description}
                  </p>
                  <p className="mt-1 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono">
                    {ent.ownership}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Quality */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Security Baseline
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {skeleton.securityBasics.map((sec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{sec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                Quality & Production Baseline
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {skeleton.qualityConsiderations.map((qc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>{qc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
