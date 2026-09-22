export type MediaStatus = "queued" | "analyzing" | "completed" | "failed";
export type AssessmentLabel = "likely_ai_generated" | "likely_authentic" | "inconclusive";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface MediaScanRecord {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  status: MediaStatus;
  overall_assessment?: AssessmentLabel | null;
  confidence?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface MediaEvidenceSignal {
  category: "metadata" | "provenance" | "watermark" | "forensic" | "detection";
  signal: string;
  description: string;
  result: "Available" | "Not detected" | "Inconclusive" | "Positive" | "Negative";
}

export interface MediaAnalysisResult {
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  dimensions?: { width: number; height: number };
  assessment: AssessmentLabel;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  provenanceDetected: boolean;
  evidence: MediaEvidenceSignal[];
}
