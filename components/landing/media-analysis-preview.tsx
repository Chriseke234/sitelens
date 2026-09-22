import React from "react";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, ShieldAlert, FileText, Info, CheckCircle2 } from "lucide-react";

export function MediaAnalysisPreview() {
  return (
    <section id="media-proof" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Text Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              Media Provenance & Authenticity
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Digital media deserves evidence.
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload an image and examine available metadata, provenance signals, and AI-detection evidence in one place.
            </p>

            <div className="pt-2 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100 flex-shrink-0 mt-0.5" />
                <span>EXIF & Container Header metadata extraction</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100 flex-shrink-0 mt-0.5" />
                <span>C2PA and digital cryptographic signature verification</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100 flex-shrink-0 mt-0.5" />
                <span>Statistical AI-generation model signals and confidence markers</span>
              </div>
            </div>

            {/* Mandatory Disclaimer Callout */}
            <div className="mt-6 rounded-lg border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-semibold text-slate-900 dark:text-slate-200">
                    Important:
                  </strong>{" "}
                  Media assessments are probabilistic and should not be treated as definitive proof.
                </p>
              </div>
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      example-image.jpg
                    </h4>
                    <span className="text-xs text-slate-400">JPEG • 2.4 MB</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                  Media Analysis Preview
                </Badge>
              </div>

              {/* Assessment Status */}
              <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Overall Assessment
                  </span>
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-1.5 text-base font-bold text-amber-900 dark:text-amber-300">
                  Assessment: Inconclusive
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Confidence Score: 52% (Signals are mixed; manual context verification advised)
                </p>
              </div>

              {/* Evidence breakdown */}
              <div className="mt-5 space-y-2.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Key Evidence Signals
                </h5>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Provenance information unavailable
                  </span>
                  <Badge variant="secondary" className="text-[10px]">No C2PA</Badge>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Limited metadata detected
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Partial EXIF</Badge>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Additional analysis required
                  </span>
                  <Badge variant="outline" className="text-[10px]">Pending</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
