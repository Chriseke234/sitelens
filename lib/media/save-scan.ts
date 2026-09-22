import { createClient } from "@/lib/supabase/server";
import { MediaAnalysisResult } from "./types";

export async function saveMediaScanResults(
  userId: string,
  analysis: MediaAnalysisResult
): Promise<{ success: boolean; scanId?: string; error?: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  try {
    // 1. Insert media_scans record
    const { data: scanRecord, error: scanError } = await supabase
      .from("media_scans")
      .insert({
        user_id: userId,
        file_url: analysis.fileUrl,
        file_type: analysis.fileType,
        status: "completed",
        overall_assessment: analysis.assessment,
        confidence: analysis.confidenceScore,
        started_at: now,
        completed_at: now,
      })
      .select("id")
      .single();

    if (scanError || !scanRecord) {
      console.error("Supabase media_scans insert error:", scanError);
      return { success: false, error: scanError?.message || "Failed to save scan record." };
    }

    const scanId = scanRecord.id;

    // 2. Insert media_evidence records
    if (analysis.evidence.length > 0) {
      const evidenceRecords = analysis.evidence.map((ev) => ({
        media_scan_id: scanId,
        category: ev.category,
        signal: ev.signal,
        description: ev.description,
        result: ev.result,
      }));

      const { error: evidenceError } = await supabase
        .from("media_evidence")
        .insert(evidenceRecords);

      if (evidenceError) {
        console.error("Supabase media_evidence insert error:", evidenceError);
      }
    }

    return { success: true, scanId };
  } catch (err: any) {
    console.error("saveMediaScanResults exception:", err);
    return { success: false, error: err.message || "Failed to persist media scan." };
  }
}
