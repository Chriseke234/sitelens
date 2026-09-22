"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileImage, ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export interface MediaScanDetail {
  id: string;
  file_url: string;
  file_type: string;
  status: string;
  overall_assessment?: string | null;
  confidence?: number | null;
  created_at: string;
  evidence: Array<{
    category: string;
    signal: string;
    description: string;
    result: string;
  }>;
}

interface MediaReportViewProps {
  scan: MediaScanDetail;
}

export function MediaReportView({ scan }: MediaReportViewProps) {
  const assessmentLabel = scan.overall_assessment
    ? scan.overall_assessment.replace(/_/g, " ").toUpperCase()
    : "INCONCLUSIVE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/media">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Media</span>
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold text-slate-900 dark:text-white">
              {scan.file_url}
            </h1>
            <p className="text-xs text-slate-500">
              Scanned on {new Date(scan.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Media Assessment
            </span>
            <div className="mt-2 flex items-center gap-3">
              <AssessmentBadge label={scan.overall_assessment} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confidence: {scan.confidence ? `${scan.confidence}%` : "Moderate"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-slate-400">File Name</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{scan.file_url}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-slate-400">MIME Format</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{scan.file_type}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-slate-400">Analysis Status</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">{scan.status}</p>
          </div>
        </div>
      </div>

      {/* Signals & Evidence Table */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Provenance & Metadata Evidence</CardTitle>
          <CardDescription className="text-xs">
            Individual multi-signal indicators evaluated for this media file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scan.evidence && scan.evidence.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Signal</th>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scan.evidence.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-3 uppercase font-semibold text-slate-500">{ev.category}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{ev.signal}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{ev.description}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        <ResultBadge result={ev.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No individual signal records found.</p>
          )}
        </CardContent>
      </Card>

      {/* Mandatory Disclaimer */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        <p className="italic text-center">
          Notice: This assessment is probabilistic and should not be treated as definitive proof of how the media was created.
        </p>
      </div>
    </div>
  );
}

function AssessmentBadge({ label }: { label?: string | null }) {
  switch (label) {
    case "likely_authentic":
      return <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 font-bold">Likely Authentic</Badge>;
    case "likely_ai_generated":
      return <Badge className="bg-purple-600 text-white text-xs px-3 py-1 font-bold">Likely AI Generated</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs px-3 py-1 font-bold">Inconclusive</Badge>;
  }
}

function ResultBadge({ result }: { result: string }) {
  if (result === "Available" || result === "Positive") {
    return <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result}</span>;
  }
  if (result === "Not detected" || result === "Negative") {
    return <span className="text-slate-400">{result}</span>;
  }
  return <span className="text-amber-600 dark:text-amber-400">{result}</span>;
}
