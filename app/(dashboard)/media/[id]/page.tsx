import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MediaReportView, MediaScanDetail } from "@/components/media/media-report-view";

interface MediaReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function MediaReportPage({ params }: MediaReportPageProps) {
  const { id: scanId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch scan record with user ownership filter
  const { data: scan } = await supabase
    .from("media_scans")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single();

  if (!scan) {
    notFound();
  }

  // Fetch evidence records for scan
  const { data: evidence } = await supabase
    .from("media_evidence")
    .select("category, signal, description, result")
    .eq("media_scan_id", scanId);

  const fullScanDetail: MediaScanDetail = {
    ...scan,
    evidence: evidence || [],
  };

  return <MediaReportView scan={fullScanDetail} />;
}
