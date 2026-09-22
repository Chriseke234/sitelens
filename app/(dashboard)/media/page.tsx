import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MediaUploadForm } from "@/components/media/media-upload-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, FileImage } from "lucide-react";

export default async function MediaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Query real database for user's media scans
  const { data: mediaScans } = await supabase
    .from("media_scans")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  const hasScans = mediaScans && mediaScans.length > 0;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Media Authenticity Scans
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Analyze digital images for EXIF metadata, C2PA provenance signatures, and statistical AI-generation signals.
        </p>
      </div>

      {/* Upload Form Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Scan an Image</CardTitle>
          <CardDescription className="text-xs">
            Upload an image (JPEG, PNG, WebP) to inspect provenance and authenticity metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaUploadForm />
        </CardContent>
      </Card>

      {/* Scan History Table Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Media Scan History</CardTitle>
          <CardDescription className="text-xs">
            Evidence-based provenance assessments and metadata reports
          </CardDescription>
        </CardHeader>

        <CardContent>
          {hasScans ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    <th className="py-2.5 px-3 font-semibold">File Name</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Assessment</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Confidence</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mediaScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                        {scan.file_url}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{scan.file_type}</td>
                      <td className="py-3 px-3 capitalize font-semibold">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {(scan.overall_assessment || "Inconclusive").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {scan.confidence ? `${scan.confidence}%` : "—"}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/media/${scan.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No media scans yet."
              description="Your media authenticity assessments will appear here once you upload an image."
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
