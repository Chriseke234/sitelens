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

// ==========================================
// AIGENSTRA V2 - AI PRODUCT ENGINEERING TYPES
// ==========================================

export type ProductType =
  | "SaaS"
  | "Marketplace"
  | "Web App"
  | "Mobile App"
  | "Internal Tool"
  | "E-commerce"
  | "AI Product"
  | "API"
  | "Landing Page"
  | "Other";

export type ProjectStage =
  | "idea"
  | "researching"
  | "planning"
  | "designing"
  | "building"
  | "almost_finished"
  | "launched";

export type CodingEnvironment =
  | "Antigravity"
  | "Cursor"
  | "Claude Code"
  | "Codex"
  | "Replit"
  | "Lovable"
  | "v0"
  | "Generic"
  | "Other";

export type CodingAgentProfile =
  | "Antigravity"
  | "Cursor"
  | "Claude Code"
  | "Codex"
  | "Replit"
  | "Generic";

export type ProjectMode = "build" | "audit";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  product_type?: ProductType;
  target_audience?: string | null;
  problem_statement?: string | null;
  raw_idea?: string | null;
  stage: ProjectStage;
  coding_environment: CodingEnvironment;
  tech_stack?: string | null;
  goal: string;
  mode: ProjectMode;
  repo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStageRecord {
  id: string;
  project_id: string;
  stage_name: string;
  status: "not_started" | "in_progress" | "completed" | "needs_attention";
  progress_pct: number;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ADR {
  id: string;
  project_id: string;
  adr_number: number;
  title: string;
  status: "proposed" | "accepted" | "superseded" | "rejected";
  context: string;
  decision: string;
  reason: string;
  consequences: string;
  alternatives: string[];
  created_at: string;
}

export interface UserPersona {
  name: string;
  goal: string;
  pain: string;
  technicalAbility: "Low" | "Medium" | "High";
  primaryTask: string;
}

export interface FunctionalRequirement {
  code: string; // e.g. FR-001
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface NonFunctionalRequirement {
  code: string; // e.g. NFR-001
  title: string;
  description: string;
  category: "Security" | "Performance" | "Reliability" | "Usability";
}

export interface DiscoveryQnA {
  id: string;
  project_id: string;
  question: string;
  answer?: string | null;
  category?: string;
  step_order: number;
  created_at: string;
}

export interface ResearchDocument {
  id: string;
  project_id: string;
  market_context: string;
  user_context: string;
  competitor_analysis: Array<{ name: string; strengths: string; weaknesses: string; differentiation: string }>;
  user_needs: string[];
  risks: Array<{ risk: string; severity: string; mitigation: string }>;
  opportunities: string[];
  assumptions: Array<{ assumption: string; status: "VERIFIED" | "INFERRED" | "ASSUMPTION" | "NEEDS RESEARCH" }>;
  hypotheses: string[];
  sources: Array<{ title: string; url?: string; notes?: string }>;
  created_at: string;
  updated_at: string;
}

export interface UserJourneyStep {
  stepNumber: number;
  title: string;
  userGoal: string;
  userAction: string;
  systemResponse: string;
  friction?: string;
  possibleFailure?: string;
  errorStates?: string[];
  alternativePaths?: string[];
  security?: string;
}

export interface UserJourney {
  id: string;
  project_id: string;
  title: string;
  persona: string;
  steps: UserJourneyStep[];
  happy_path: string[];
  edge_cases: Array<{ scenario: string; resolution: string }>;
  failure_paths: Array<{ trigger: string; userMessage: string; fallbackAction: string }>;
  created_at: string;
  updated_at: string;
}

export interface ProductSpec {
  id: string;
  project_id: string;
  problem_statement: string;
  target_users: string[];
  personas?: UserPersona[];
  goals: string[];
  non_goals: string[];
  user_stories: Array<{ title: string; asA: string; iWantTo: string; soThat: string; priority: string }>;
  functional_reqs: string[];
  structured_functional_reqs?: FunctionalRequirement[];
  non_functional_reqs: string[];
  structured_non_functional_reqs?: NonFunctionalRequirement[];
  business_rules: string[];
  acceptance_criteria: string[];
  edge_cases: string[];
  mvp_scope: string[];
  future_scope: string[];
  created_at: string;
  updated_at: string;
}

export interface DesignSpec {
  id: string;
  project_id: string;
  sitemap: Array<{ page: string; path: string; purpose: string; actions: string[] }>;
  user_flows: string[];
  pages: string[];
  components: Array<{ name: string; purpose: string; props: string[]; states: string[] }>;
  responsive_reqs: string[];
  accessibility_reqs: string[];
  states: Array<{ stateType: "empty" | "loading" | "error" | "success"; pageOrComponent: string; description: string }>;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureDoc {
  id: string;
  project_id: string;
  frontend: { framework: string; routing: string; stateManagement: string; errorHandling: string };
  backend: { framework: string; apiRoutes: string; serverActions: string; validation: string };
  database_schema: { entities: string[]; relationships: string[]; constraints: string[] };
  authentication: { authType: string; sessionManagement: string; roles: string[] };
  storage: { fileStorage: string; accessControl: string };
  integrations: Array<{ name: string; type: string; securityNote: string }>;
  created_at: string;
  updated_at: string;
}

export interface SecurityPlan {
  id: string;
  project_id: string;
  authentication_rules: Array<{ requirement: string; why: string; where: string; verify: string }>;
  authorization_rules: Array<{ requirement: string; why: string; where: string; verify: string }>;
  database_security: Array<{ requirement: string; why: string; where: string; verify: string }>;
  api_security: Array<{ requirement: string; why: string; where: string; verify: string }>;
  input_validation: Array<{ requirement: string; why: string; where: string; verify: string }>;
  secret_management: Array<{ requirement: string; why: string; where: string; verify: string }>;
  threat_model: Array<{ threat: string; impact: string; mitigation: string }>;
  created_at: string;
  updated_at: string;
}

export type AgentRole =
  | "Orchestrator Agent"
  | "Product Agent"
  | "UX Agent"
  | "Design Agent"
  | "Implementation Advisor"
  | "Security Agent"
  | "QA Agent"
  | "Performance Agent"
  | "Auditor Agent";

export type AgentMessageType =
  | "ANALYSIS"
  | "QUESTION"
  | "CONCERN"
  | "PROPOSAL"
  | "DISAGREEMENT"
  | "AGREEMENT"
  | "DECISION";

export interface AgentMessage {
  agentId: string;
  agentName: AgentRole;
  messageType?: AgentMessageType;
  content: string;
  timestamp: string;
}

export interface AgentDiscussion {
  id: string;
  project_id: string;
  topic: string;
  status: "active" | "resolved" | "closed";
  agent_messages: AgentMessage[];
  created_at: string;
  updated_at: string;
}

export interface AgentDecision {
  id: string;
  project_id: string;
  discussion_id?: string | null;
  decision_number: number;
  topic: string;
  problem: string;
  decision: string;
  reason: string;
  agent_contributions: Array<{ agentName: string; stance: string }>;
  alternatives_considered: string[];
  impacted_areas: string[];
  status: string;
  created_at: string;
}

export type PromptCategory =
  | "product"
  | "ux"
  | "ui"
  | "frontend"
  | "backend"
  | "database"
  | "api"
  | "authentication"
  | "security"
  | "testing"
  | "deployment"
  | "audit"
  | "fix";

export interface Prompt {
  id: string;
  project_id: string;
  category: PromptCategory;
  title: string;
  current_version: number;
  status: "draft" | "used" | "successful" | "deprecated";
  created_at: string;
  updated_at: string;
}

/**
 * 16-Part Implementation Prompt Version Record (Phase 5)
 */
export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  role: string;
  project_context: string;
  current_state: string;
  objective: string;
  requirements: string[];
  existing_architecture?: string;
  technical_constraints?: string[];
  ux_requirements?: string[];
  security_requirements: string[];
  edge_cases: string[];
  do_not_change?: string[];
  acceptance_criteria: string[];
  testing_requirements?: string[];
  validation: string[];
  expected_output: string;
  full_prompt_text: string;
  created_at: string;
}

export type BuildSessionStatus = "not_started" | "in_progress" | "implemented" | "needs_review";

export interface BuildSession {
  id: string;
  project_id: string;
  title: string;
  stage: string;
  coding_agent: CodingAgentProfile;
  prompt_id?: string | null;
  status: BuildSessionStatus;
  user_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type FindingCategory =
  | "product"
  | "ux"
  | "frontend"
  | "backend"
  | "api"
  | "security"
  | "qa"
  | "performance"
  | "seo"
  | "accessibility"
  | "code_quality";

export type FindingConfidence = "confirmed" | "likely" | "potential" | "unable_to_verify";

export type FindingLifecycleStatus =
  | "open"
  | "fix_prompt_generated"
  | "user_implementing"
  | "ready_for_verification"
  | "resolved"
  | "regressed";

export interface AuditFinding {
  id: string;
  project_id: string;
  project_audit_id?: string | null;
  finding_code: string; // e.g. SEC-014
  category: FindingCategory;
  severity: SeverityLevel;
  title: string;
  simple_explanation: string;
  technical_explanation: string;
  evidence: string; // e.g. GET /api/projects/[id]
  affected_file_or_route?: string | null;
  potential_impact: string;
  recommended_fix: string;
  verification_method?: string | null;
  confidence: FindingConfidence;
  related_files: string[];
  status: "open" | "in_progress" | "resolved" | "partially_resolved" | "unable_to_verify";
  lifecycle_status: FindingLifecycleStatus;
  created_at: string;
  updated_at: string;
}

export interface FixPrompt {
  id: string;
  finding_id: string;
  project_id: string;
  prompt_text: string;
  requirements: string[];
  verification_steps: string[];
  status: "generated" | "copied" | "applied" | "verified";
  created_at: string;
}

export interface ReAuditRecord {
  id: string;
  project_id: string;
  previous_audit_id?: string | null;
  new_audit_id?: string | null;
  resolved_findings_count: number;
  regressed_findings_count: number;
  still_present_count: number;
  comparison_summary: string;
  evidence_log: Array<{
    findingCode: string;
    previousState: string;
    currentState: string;
    verdict: "RESOLVED" | "PARTIALLY RESOLVED" | "STILL PRESENT" | "REGRESSED" | "UNABLE TO VERIFY";
    explanation: string;
  }>;
  created_at: string;
}

export interface ProjectShare {
  id: string;
  project_id: string;
  share_token: string;
  is_active: boolean;
  expires_at?: string | null;
  created_by: string;
  created_at: string;
}

export interface ProductionChecklistItem {
  id: string;
  project_id: string;
  category: "product" | "ux" | "engineering" | "security" | "performance" | "seo";
  item_key: string;
  title: string;
  is_checked: boolean;
  notes?: string | null;
  updated_at: string;
}

export interface TraceabilityNode {
  stage: string;
  title: string;
  referenceId: string;
  status: "verified" | "in_progress" | "open" | "resolved";
  details: string;
}
