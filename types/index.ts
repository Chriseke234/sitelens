/**
 * User Profile Record
 */
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Audit Status Lifecycle
 */
export type AuditStatus = "queued" | "analyzing" | "completed" | "failed";

/**
 * Issue Category
 */
export type AuditCategory =
  | "seo"
  | "performance"
  | "accessibility"
  | "ux"
  | "trust"
  | "conversion";

/**
 * Severity Rating
 */
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

/**
 * Audit Overview Record
 */
export interface AuditRecord {
  id: string;
  user_id: string;
  url: string;
  status: AuditStatus;
  overall_score?: number | null;
  seo_score?: number | null;
  performance_score?: number | null;
  accessibility_score?: number | null;
  ux_score?: number | null;
  trust_score?: number | null;
  conversion_score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

/**
 * Audit Page Record
 */
export interface AuditPage {
  id: string;
  audit_id: string;
  url: string;
  title?: string | null;
  status_code?: number | null;
  load_time?: number | null;
  screenshot_url?: string | null;
  created_at: string;
}

/**
 * Audit Issue Detail Record
 */
export interface AuditIssue {
  id: string;
  audit_id: string;
  page_id?: string | null;
  category: AuditCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  created_at: string;
}

/**
 * Media Scan Lifecycle Status
 */
export type MediaScanStatus = "queued" | "analyzing" | "completed" | "failed";

/**
 * Media Scan Assessment Categories
 */
export type MediaAssessmentCategory =
  | "likely_ai_generated"
  | "likely_authentic"
  | "inconclusive";

/**
 * Media Scan Record
 */
export interface MediaScanRecord {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  status: MediaScanStatus;
  overall_assessment?: MediaAssessmentCategory | null;
  confidence?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

/**
 * Media Evidence Record
 */
export interface MediaEvidence {
  id: string;
  media_scan_id: string;
  category: "metadata" | "provenance" | "watermark" | "forensic" | "detection";
  signal: string;
  description: string;
  result: string;
  created_at: string;
}
