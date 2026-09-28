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
  | "Replit"
  | "Lovable"
  | "v0"
  | "Other";

export type ProjectMode = "build" | "audit";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  coding_environment: CodingEnvironment;
  tech_stack?: string | null;
  goal: string;
  mode: ProjectMode;
  repo_url?: string | null;
  created_at: string;
  updated_at: string;
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
  assumptions: Array<{ assumption: string; status: "verified" | "unverified" | "hypothesis" }>;
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
  goals: string[];
  non_goals: string[];
  user_stories: Array<{ title: string; asA: string; iWantTo: string; soThat: string; priority: string }>;
  functional_reqs: string[];
  non_functional_reqs: string[];
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
  | "Product Manager Agent"
  | "Research Agent"
  | "UX Agent"
  | "UI Agent"
  | "Frontend Engineer Agent"
  | "Backend Engineer Agent"
  | "Security Engineer Agent"
  | "QA Agent"
  | "Performance Agent"
  | "Auditor Agent"
  | "Orchestrator Agent";

export interface AgentMessage {
  agentId: string;
  agentName: AgentRole;
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
  | "design"
  | "architecture"
  | "database"
  | "authentication"
  | "backend"
  | "api"
  | "frontend"
  | "testing"
  | "security"
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

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  role: string;
  project_context: string;
  current_state: string;
  objective: string;
  requirements: string[];
  constraints: string[];
  security_requirements: string[];
  edge_cases: string[];
  acceptance_criteria: string[];
  validation: string[];
  output_requirements: string;
  full_prompt_text: string;
  created_at: string;
}

export type FindingCategory =
  | "product"
  | "ux"
  | "frontend"
  | "backend"
  | "security"
  | "performance"
  | "seo"
  | "accessibility"
  | "code_quality";

export interface AuditFinding {
  id: string;
  project_id: string;
  project_audit_id?: string | null;
  finding_code: string;
  category: FindingCategory;
  severity: SeverityLevel;
  title: string;
  simple_explanation: string;
  technical_explanation: string;
  evidence: string;
  potential_impact: string;
  recommended_fix: string;
  related_files: string[];
  status: "open" | "in_progress" | "resolved" | "partially_resolved" | "unable_to_verify";
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

