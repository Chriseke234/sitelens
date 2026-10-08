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

export type QuestionPriority = "MUST_KNOW" | "HELPFUL" | "OPTIONAL";

export interface AdaptiveDiscoveryQuestion {
  id?: string;
  question: string;
  priority: QuestionPriority;
  whyItMatters: string;
  suggestedOptions?: string[];
  defaultRecommendation: string;
  defaultAssumption: string;
}

export type ConfidenceLevel = "CONFIRMED" | "INFERRED" | "ASSUMED" | "UNKNOWN";
export type AssumptionStatus = "PROVISIONAL" | "CONFIRMED" | "REJECTED" | "SUPERSEDED";

export interface IdeaUnderstandingRecord {
  rawIdea: string;
  normalizedDescription: string;
  likelyProductType: string;
  targetUsers: string[];
  primaryOutcome: string;
  detectedFeatures: string[];
  detectedActors: string[];
  detectedWorkflows: string[];
  uncertainties: string[];
  missingInformation: string[];
  confidence: ConfidenceLevel;
  initialAssumptions: string[];
}

export interface ProductAssumption {
  id?: string;
  statement: string;
  reason: string;
  source: "user_input" | "ai_recommendation" | "default";
  status: AssumptionStatus;
  confidence: ConfidenceLevel;
  relatedArea?: string;
}

export interface ProductSummary {
  whatBuilding: string;
  whoFor: string[];
  mainExperience: string;
  businessExperience?: string;
  coreCapabilities: string[];
  activeAssumptions: ProductAssumption[];
  decisionsLeft: string[];
  isSufficient: boolean;
}

export type ItemSource =
  | "USER_CONFIRMED"
  | "USER_DESCRIBED"
  | "SYSTEM_INFERRED"
  | "SYSTEM_RECOMMENDED"
  | "ASSUMED";

export type ItemStatus =
  | "CONFIRMED"
  | "PROPOSED"
  | "ASSUMED"
  | "NEEDS_DECISION"
  | "DEFERRED"
  | "COMPLETED";

export interface BlueprintOverview {
  name: string;
  summary: string;
  problemStatement: string;
  valueProposition: string;
  productType: string;
  targetOutcome: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintUserRole {
  id: string;
  roleName: string;
  simpleDescription: string;
  technicalPermissions: string[];
  userGoals: string[];
  restrictions: string[];
  relatedRoles: string[];
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintUserJourneyStep {
  stepNumber: number;
  title: string;
  userAction: string;
  systemResponse: string;
  technicalImplication?: string;
}

export interface BlueprintUserJourney {
  id: string;
  title: string;
  role: string;
  happyPathSteps: BlueprintUserJourneyStep[];
  frictionPoints: string[];
  failureScenarios: Array<{ scenario: string; resolution: string }>;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintFeature {
  id: string;
  title: string;
  simpleDescription: string;
  technicalDetails: string;
  category: "CORE_MVP" | "SUPPORTING" | "ADMIN" | "FUTURE";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintScreen {
  id: string;
  screenName: string;
  routePath: string;
  simplePurpose: string;
  accessRoles: string[];
  keyComponents: string[];
  emptyState: string;
  loadingState: string;
  errorState: string;
  technicalNotes?: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintWorkflow {
  id: string;
  name: string;
  trigger: string;
  simpleDescription: string;
  steps: string[];
  technicalServices: string[];
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintBusinessRule {
  id: string;
  code: string;
  ruleStatement: string;
  reason: string;
  enforcementLevel: "STRICT" | "WARNING" | "INFO";
  technicalConstraint?: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintDataAttribute {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface BlueprintDataEntity {
  id: string;
  entityName: string;
  simpleDescription: string;
  ownershipRole: string;
  attributes: BlueprintDataAttribute[];
  lifecycleStates: string[];
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintIntegration {
  id: string;
  serviceName: string;
  category: "AUTH" | "PAYMENT" | "EMAIL" | "AI" | "STORAGE" | "ANALYTICS" | "OTHER";
  purpose: string;
  fallbackPlan: string;
  technicalApiNotes?: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintAdminTool {
  id: string;
  toolName: string;
  simpleDescription: string;
  operationalPurpose: string;
  restrictedToRoles: string[];
  technicalCapabilities: string[];
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintSecurityRule {
  id: string;
  title: string;
  simpleDescription: string;
  category: "AUTHENTICATION" | "AUTHORIZATION" | "DATA_PROTECTION" | "PRIVACY" | "RATE_LIMITING";
  technicalImplementation: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintQualityTarget {
  id: string;
  category: "RESPONSIVENESS" | "ACCESSIBILITY" | "PERFORMANCE" | "TESTING";
  requirement: string;
  targetMetric?: string;
  technicalApproach: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface BlueprintFuturePath {
  id: string;
  title: string;
  simpleDescription: string;
  phase: "POST_MVP" | "V2" | "SCALE";
  technicalArchitectureNote: string;
  source: ItemSource;
  status: ItemStatus;
}

export interface SoftwareBlueprint {
  id?: string;
  project_id: string;
  overview: BlueprintOverview;
  usersRoles: BlueprintUserRole[];
  userJourneys: BlueprintUserJourney[];
  features: BlueprintFeature[];
  screens: BlueprintScreen[];
  workflows: BlueprintWorkflow[];
  businessRules: BlueprintBusinessRule[];
  dataEntities: BlueprintDataEntity[];
  integrations: BlueprintIntegration[];
  adminTools: BlueprintAdminTool[];
  security: BlueprintSecurityRule[];
  quality: BlueprintQualityTarget[];
  futureConsiderations: BlueprintFuturePath[];
  healthScore: number;
  healthWarnings: string[];
  updated_at: string;
}

export type BuildStageStatus =
  | "NOT_STARTED"
  | "READY"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "DEFERRED";

export interface BuildStage {
  id: string;
  stageNumber: number;
  title: string;
  userCentricName: string;
  whyThisExists: string;
  deliverables: string[];
  associatedScreens: string[];
  associatedEntities: string[];
  dependencies: string[];
  status: BuildStageStatus;
  agentGuidance: string;
  estimatedComplexity: "LOW" | "MEDIUM" | "HIGH";
}

export interface BuildMap {
  id?: string;
  project_id: string;
  stages: BuildStage[];
  currentStageNumber: number;
  totalStages: number;
  completedStages: number;
  updated_at: string;
}

export interface BlueprintHealthIssue {
  id: string;
  type: "ERROR" | "WARNING" | "SUGGESTION";
  section: string;
  message: string;
  recommendation: string;
  affectedItemIds?: string[];
}

export interface BlueprintHealthReport {
  score: number;
  issues: BlueprintHealthIssue[];
  isReadyForBuild: boolean;
  strengths: string[];
}

// ==========================================
// PHASE 3 — ENGINEERING INTELLIGENCE TYPES
// ==========================================

export type EngineeringDomain =
  | "PRODUCT_ARCHITECTURE"
  | "UX_ARCHITECTURE"
  | "UI_ARCHITECTURE"
  | "FRONTEND"
  | "BACKEND"
  | "API_CONTRACTS"
  | "DATABASE"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "SECURITY"
  | "PERFORMANCE"
  | "ACCESSIBILITY"
  | "TESTING"
  | "DEPLOYMENT"
  | "SEO";

export interface EngineeringDomainItem {
  id: string;
  domain: EngineeringDomain;
  title: string;
  simpleExplanation: string;
  whyItMatters: string;
  technicalSpecification: string;
  affectedFeatures: string[];
  affectedScreens: string[];
  affectedEntities: string[];
  source: ItemSource;
  status: ItemStatus;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface ApiContract {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  purpose: string;
  inputPayload: string;
  outputPayload: string;
  errorCodes: Array<{ code: number; scenario: string; resolution: string }>;
  rateLimitPolicy: string;
  authRequired: boolean;
  rolesAllowed: string[];
}

export interface EntityRelationship {
  id: string;
  fromEntity: string;
  toEntity: string;
  relationType: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY";
  foreignKey: string;
  onDelete: "CASCADE" | "SET_NULL" | "RESTRICT";
  simpleMeaning: string;
}

export interface StateTransition {
  id: string;
  entity: string;
  fromState: string;
  toState: string;
  allowedRoles: string[];
  trigger: string;
  sideEffects: string[];
  preventedIf?: string;
}

export interface TechnicalRecommendationAlternative {
  name: string;
  description: string;
  pros: string;
  cons: string;
}

export interface TechnicalRecommendation {
  id: string;
  title: string;
  area:
    | "DATABASE"
    | "AUTH"
    | "PAYMENTS"
    | "FILE_STORAGE"
    | "AI_INTEGRATION"
    | "DEPLOYMENT"
    | "EMAIL"
    | "OTHER";
  requirement: string;
  recommendedOption: string;
  whyRecommended: string;
  tradeoffs: string;
  alternatives: TechnicalRecommendationAlternative[];
  status: "RECOMMENDED" | "USER_CONFIRMED" | "UNDECIDED" | "DEFERRED";
  selectedOption?: string;
}

export interface TraceabilityItem {
  featureId: string;
  featureTitle: string;
  screens: string[];
  workflows: string[];
  dataEntities: string[];
  apiEndpoints: string[];
  backendServices: string[];
  authorizationRules: string[];
  testCases: string[];
}

export interface EngineeringBlocker {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  affectedDomain: EngineeringDomain;
  resolution: string;
}

export interface EngineeringReadinessReport {
  status: "READY" | "NEEDS_DECISIONS" | "BLOCKED";
  domainReadiness: Record<string, "READY" | "NEEDS_REVIEW" | "UNDECIDED" | "BLOCKED">;
  blockers: EngineeringBlocker[];
  unresolvedDecisionsCount: number;
  changeImpacts: Array<{
    productChange: string;
    affectedEngineeringAreas: string[];
    recommendation: string;
  }>;
}

export interface EngineeringBlueprint {
  id?: string;
  project_id: string;
  highLevelFlow: {
    userInterface: string;
    applicationLogic: string;
    databaseLayer: string;
    externalServices: string;
  };
  domains: Record<EngineeringDomain, EngineeringDomainItem[]>;
  apiContracts: ApiContract[];
  entityRelationships: EntityRelationship[];
  stateTransitions: StateTransition[];
  recommendations: TechnicalRecommendation[];
  traceabilityMatrix: TraceabilityItem[];
  readiness: EngineeringReadinessReport;
  updated_at: string;
}

// ==========================================
// PHASE 4 — TASK PLANNING & CONTEXT ENGINE
// ==========================================

export type TaskType =
  | "FEATURE"
  | "BUG"
  | "REFACTOR"
  | "UI"
  | "FRONTEND"
  | "BACKEND"
  | "API"
  | "DATABASE"
  | "AUTH"
  | "SECURITY"
  | "PERFORMANCE"
  | "TESTING"
  | "CONFIGURATION"
  | "DOCUMENTATION";

export type TaskPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TaskStatus =
  | "BACKLOG"
  | "READY"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "DEFERRED"
  | "PROMPT_GENERATED"
  | "HANDED_OFF"
  | "IMPLEMENTED_BY_USER"
  | "AUDIT_PENDING"
  | "VERIFIED"
  | "NEEDS_MORE_WORK";

export type TaskReadiness =
  | "READY"
  | "NEEDS_INFORMATION"
  | "NEEDS_DECISION"
  | "BLOCKED"
  | "READY_FOR_CONTEXT"
  | "READY_FOR_PROMPT";

export type TaskComplexity = "SMALL" | "MEDIUM" | "LARGE" | "COMPLEX";

export type TaskSource =
  | "BUILD_MAP"
  | "BLUEPRINT"
  | "ENGINEERING"
  | "USER_REQUEST"
  | "AIGENSTRA_RECOMMENDATION"
  | "AUDIT_FINDING";

export interface ChangeBoundaries {
  mustChange: string[];
  mayChange: string[];
  mustNotChange: string[];
}

export interface AigenstraTask {
  id: string;
  project_id: string;
  title: string;
  short_description: string;
  purpose: string;
  user_value: string;
  task_type: TaskType;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  readiness: TaskReadiness;
  complexity: TaskComplexity;
  source: TaskSource;
  stageNumber: number;
  dependencies: string[];
  blocked_by: string[];
  related_blueprint_items: string[];
  related_engineering_items: string[];
  related_decisions: string[];
  related_assumptions: string[];
  affected_screens: string[];
  affected_entities: string[];
  affected_apis: string[];
  acceptance_criteria: string[];
  change_boundaries: ChangeBoundaries;
  context_pack_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContextPackItem {
  id: string;
  source: string;
  title: string;
  content: string;
  reason: string;
  relevance: "DIRECT" | "SUPPORTING" | "DEPENDENCY" | "CONSTRAINT" | "SECURITY";
  priority: number;
}

export interface ContextPackExclusion {
  id: string;
  source: string;
  title: string;
  reason: string;
}

export interface ContextPack {
  id: string;
  taskId: string;
  taskTitle: string;
  summary: string;
  includedItems: ContextPackItem[];
  excludedItems: ContextPackExclusion[];
  constraints: ChangeBoundaries;
  acceptanceCriteria: string[];
  securityConsiderations: string[];
  testingRequirements: string[];
  estimatedSize: {
    itemCount: number;
    characterCount: number;
    label: string;
  };
  isStale: boolean;
  staleReason?: string;
  repository?: TaskRepositoryContext;
  snapshotId?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRecommendation {
  recommendedTaskId: string;
  recommendedTaskTitle: string;
  whyNext: string;
  prerequisitesMet: boolean;
  alternativeReadyTasks: Array<{
    taskId: string;
    title: string;
    reason: string;
  }>;
}

export interface BlueprintSkeleton {
  productOverview: {
    name: string;
    type: string;
    purpose: string;
    targetUsers: string[];
  };
  experiences: Array<{
    userRole: string;
    coreGoal: string;
    keyWorkflow: string;
  }>;
  features: Array<{
    title: string;
    description: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM";
  }>;
  screens: Array<{
    name: string;
    purpose: string;
    keyActions: string[];
  }>;
  dataEntities: Array<{
    name: string;
    description: string;
    ownership: string;
  }>;
  securityBasics: string[];
  qualityConsiderations: string[];
}

export interface DiscoveryQnA {
  id: string;
  project_id: string;
  question: string;
  answer?: string | null;
  category?: string;
  priority?: QuestionPriority;
  why_it_matters?: string;
  is_assumption?: boolean;
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

export type PromptQualityStatus =
  | "READY"
  | "READY_WITH_ASSUMPTIONS"
  | "NEEDS_REVIEW"
  | "NOT_READY";

export type PromptSectionKey =
  | "ROLE"
  | "OBJECTIVE"
  | "PROJECT_CONTEXT"
  | "CURRENT_STATE"
  | "RELEVANT_CONTEXT"
  | "REQUIREMENTS"
  | "CHANGE_BOUNDARIES"
  | "SECURITY"
  | "EDGE_CASES"
  | "ACCEPTANCE_CRITERIA"
  | "TESTING_EXPECTATIONS"
  | "EXPECTED_OUTPUT";

export interface PromptSection {
  key: PromptSectionKey;
  title: string;
  content: string;
  purpose: string;
}

export interface PromptOptimizationResult {
  rawCharacterCount: number;
  optimizedCharacterCount: number;
  rawEstimatedTokens: number;
  optimizedEstimatedTokens: number;
  reductionPercentage: number;
  optimizationsApplied: string[];
  contradictionsDetected: Array<{
    ruleA: string;
    ruleB: string;
    resolution: string;
  }>;
}

export interface CompiledPrompt {
  id: string;
  projectId: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  targetAgent: CodingAgentProfile;
  sections: PromptSection[];
  markdownText: string;
  qualityStatus: PromptQualityStatus;
  readinessScore: number;
  optimization: PromptOptimizationResult;
  version: number;
  repositorySnapshotId?: string;
  repositoryRevision?: string;
  repositoryFindings?: string[];
  created_at: string;
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

// ==========================================
// PHASE 6 — PROJECT CONNECTION & REPOSITORY INTELLIGENCE
// ==========================================

export type ConnectionSourceType =
  | "UPLOAD_FOLDER"
  | "UPLOAD_ARCHIVE"
  | "GIT_PUBLIC"
  | "GIT_PROVIDER"
  | "LOCAL_PATH";

export type ConnectionStatus = "ACTIVE" | "DISCONNECTED" | "ERROR";

export interface ProjectConnection {
  id: string;
  project_id: string;
  source_type: ConnectionSourceType;
  source_reference?: string;
  branch?: string;
  status: ConnectionStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type SnapshotStatus =
  | "QUEUED"
  | "ANALYZING"
  | "READY"
  | "PARTIAL"
  | "FAILED"
  | "STALE";

export type FileClassificationType =
  | "SOURCE"
  | "COMPONENT"
  | "ROUTE"
  | "API"
  | "DATABASE"
  | "CONFIG"
  | "TEST"
  | "DOCUMENTATION"
  | "ASSET"
  | "STYLE"
  | "SCRIPT"
  | "UNKNOWN";

export type FileSensitivity =
  | "NONE"
  | "POSSIBLE_SECRET"
  | "CONFIG_SENSITIVE"
  | "CONFIRMED_SECRET";

export type FileImportance = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RepositoryFile {
  id: string;
  project_id: string;
  snapshot_id: string;
  path: string;
  extension: string;
  size_bytes: number;
  sha256_hash?: string;
  file_type: FileClassificationType;
  language?: string;
  importance: FileImportance;
  sensitivity: FileSensitivity;
  is_ignored: boolean;
  ignore_reason?: string;
  analysis_status: "PENDING" | "ANALYZED" | "SKIPPED" | "FAILED";
  created_at: string;
}

export type SymbolKind =
  | "FUNCTION"
  | "COMPONENT"
  | "HOOK"
  | "ROUTE_HANDLER"
  | "CLASS"
  | "INTERFACE"
  | "TYPE"
  | "SERVICE"
  | "SCHEMA"
  | "CONSTANT";

export interface RepositorySymbol {
  id: string;
  project_id: string;
  snapshot_id: string;
  file_id: string;
  file_path: string;
  name: string;
  kind: SymbolKind;
  start_line: number;
  end_line: number;
  is_exported: boolean;
  signature?: string;
  documentation?: string;
  dependencies: string[];
  created_at: string;
}

export interface RepositoryChunk {
  id: string;
  project_id: string;
  snapshot_id: string;
  file_id: string;
  symbol_id?: string;
  file_path: string;
  chunk_type: string;
  start_line: number;
  end_line: number;
  content: string; // Guaranteed redacted
  character_count: number;
  estimated_tokens: number;
  content_hash: string;
  created_at: string;
}

export interface RepositoryRelation {
  id: string;
  project_id: string;
  snapshot_id: string;
  source_path: string;
  target_path: string;
  relation_type: "IMPORTS" | "CALLS" | "EXPOSES_ROUTE" | "USES_SCHEMA" | "MOUNTS_COMPONENT";
  details?: Record<string, any>;
  created_at: string;
}

export type ArchitectureConfidence =
  | "CONFIRMED_BY_SOURCE"
  | "STRONGLY_INFERRED"
  | "POSSIBLY_INFERRED"
  | "UNKNOWN";

export interface DetectedArchitecture {
  framework: string;
  frameworkConfidence: ArchitectureConfidence;
  languages: string[];
  packageManager?: string;
  database?: string;
  databaseConfidence: ArchitectureConfidence;
  authentication?: string;
  authConfidence: ArchitectureConfidence;
  apiPattern?: string;
  uiLibraries: string[];
  testFrameworks: string[];
  buildTool?: string;
  architecturePattern: string; // e.g., "Full-Stack Server-Rendered (Next.js App Router)"
  architectureConfidence: ArchitectureConfidence;
}

export interface ArchitectureDriftObservation {
  domain: string;
  planned: string;
  actual: string;
  differenceSummary: string;
  implication: string;
  recommendation: string;
}

export interface DuplicateSystemWarning {
  systemType: string; // "AUTHENTICATION", "DATABASE", "API_ROUTING", "STATE"
  systemsFound: string[];
  warningMessage: string;
  recommendation: string;
}

export interface RepositoryRoute {
  path: string;
  filePath: string;
  routeType: "PAGE" | "API" | "LAYOUT" | "MIDDLEWARE";
  httpMethods?: string[];
  isProtected?: boolean;
  authIndicator?: string;
}

export interface RepositoryProjectArea {
  name: string;
  category: string;
  description: string;
  paths: string[];
  confidence: ArchitectureConfidence;
}

export interface RepositoryManifest {
  projectName: string;
  sourceType: ConnectionSourceType;
  sourceReference?: string;
  branch?: string;
  revision?: string;
  architecture: DetectedArchitecture;
  routes: RepositoryRoute[];
  areas: RepositoryProjectArea[];
  majorDependencies: Array<{ name: string; version?: string; role: string }>;
  existingCapabilities: Array<{ capability: string; evidence: string; paths: string[] }>;
  driftObservations: ArchitectureDriftObservation[];
  duplicateWarnings: DuplicateSystemWarning[];
  analysisQuality: {
    frameworkDetected: boolean;
    routesMapped: boolean;
    databaseDetected: boolean;
    authDetected: boolean;
    evidenceNotes: string[];
  };
}

export interface RepositorySnapshot {
  id: string;
  project_id: string;
  connection_id?: string;
  revision?: string;
  status: SnapshotStatus;
  file_count: number;
  analyzed_file_count: number;
  ignored_file_count: number;
  is_active: boolean;
  warnings: string[];
  errors: string[];
  manifest: RepositoryManifest;
  project_map: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RepositoryFeatureMapping {
  id: string;
  project_id: string;
  snapshot_id: string;
  feature_key: string;
  feature_title: string;
  code_area: string;
  related_paths: string[];
  confidence: ArchitectureConfidence;
  observation?: string;
  created_at: string;
}

export type TaskFileRelevanceLevel =
  | "DIRECT"
  | "RELATED"
  | "DEPENDENCY"
  | "REFERENCE"
  | "IRRELEVANT"
  | "UNKNOWN";

export interface TaskRelevantFile {
  filePath: string;
  fileType: FileClassificationType;
  relevance: TaskFileRelevanceLevel;
  reason: string;
  relevantSymbols?: string[];
  confidence: ArchitectureConfidence;
}

export interface TaskRelevantChunk {
  chunkId: string;
  filePath: string;
  symbolName?: string;
  startLine: number;
  endLine: number;
  content: string;
  reason: string;
  estimatedTokens: number;
}

export interface TaskRepositoryContext {
  snapshotId: string;
  revision?: string;
  detectedStack: string;
  relevantFiles: TaskRelevantFile[];
  relevantChunks: TaskRelevantChunk[];
  excludedFiles: Array<{ filePath: string; reason: string }>;
  existingCapabilitiesToPreserve: string[];
  driftObservations: ArchitectureDriftObservation[];
  duplicateWarnings: DuplicateSystemWarning[];
  warnings: string[];
  isSnapshotStale?: boolean;
}

export interface TaskContextOverride {
  id: string;
  project_id: string;
  task_id: string;
  file_path: string;
  override_action: "FORCE_INCLUDE" | "FORCE_EXCLUDE" | "MARK_IMPORTANT";
  user_rationale?: string;
  created_at: string;
}

// ==========================================
// PHASE 7 — PROJECT AUDIT + FINDINGS + EVIDENCE
// ==========================================

export type AuditScope =
  | "FULL"
  | "PRODUCT"
  | "UX"
  | "UI"
  | "ENGINEERING"
  | "SECURITY"
  | "PERFORMANCE"
  | "TESTING";

export type AuditDimension =
  | "PRODUCT"
  | "UX"
  | "UI"
  | "FRONTEND"
  | "BACKEND"
  | "API"
  | "DATABASE"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "SECURITY"
  | "PERFORMANCE"
  | "ACCESSIBILITY"
  | "TESTING";

export type FindingState =
  | "VERIFIED"
  | "PASS_WITH_NOTES"
  | "NEEDS_REVIEW"
  | "ISSUE"
  | "CRITICAL"
  | "NOT_VERIFIABLE"
  | "NOT_APPLICABLE";

export type FindingSeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type RequirementCoverageStatus =
  | "VERIFIED"
  | "PARTIALLY_SUPPORTED"
  | "MISSING"
  | "CONFLICTING"
  | "UNABLE_TO_VERIFY"
  | "NOT_APPLICABLE";

export interface FindingEvidence {
  filePath?: string;
  symbolName?: string;
  route?: string;
  lineRange?: [number, number];
  snippet?: string;
  blueprintRef?: string;
  engineeringRef?: string;
  observedDiff?: string;
}

export interface Phase7Finding {
  id: string;
  projectId: string;
  auditId: string;
  findingCode: string; // e.g. "AUTH-001", "SEC-002", "UX-003", "PROD-001"
  category: AuditDimension;
  severity: FindingSeverityLevel;
  status: FindingState;
  title: string;
  summary: string; // Simple explanation for vibe coders
  description: string; // Technical explanation
  impact: string; // Real world consequence
  evidence: FindingEvidence;
  expectedBehavior: string;
  observedBehavior: string;
  recommendation: string;
  verificationCriteria: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  affectedFeature?: string;
  affectedScreen?: string;
  affectedWorkflow?: string;
  affectedFile?: string;
  affectedSymbol?: string;
  sourceRequirement?: string;
  fixStatus: "OPEN" | "FIX_PROMPT_READY" | "HANDED_OFF" | "AWAITING_VERIFICATION";
  previousFindingId?: string;
  regressionCount?: number;
  resolvedAt?: string;
  verificationId?: string;
  verificationStatus?: VerificationStatus;
  userOverride?: {
    action: "DISMISSED" | "MARKED_NA" | "MANUAL_REVIEW";
    rationale: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RequirementCoverageItem {
  id: string;
  projectId: string;
  auditId: string;
  requirementId: string;
  requirementType: "FEATURE" | "WORKFLOW" | "SECURITY_RULE" | "DATA_ENTITY" | "API_CONTRACT";
  title: string;
  coverageStatus: RequirementCoverageStatus;
  evidencePaths: string[];
  observations?: string;
}

export interface AuditSnapshot {
  id: string;
  projectId: string;
  repositorySnapshotId?: string;
  blueprintRevision?: string;
  engineeringRevision?: string;
  auditScope: AuditScope;
  status: "QUEUED" | "ANALYZING" | "COMPLETED" | "PARTIAL" | "FAILED";
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    verifiedCount: number;
    totalFindings: number;
    biggestIssue?: string;
    nextRecommendedAction?: string;
    dimensionSummaries?: Record<string, { status: FindingState; findingCount: number; notes: string }>;
  };
  coverage: {
    totalRequirements: number;
    verifiedRequirements: number;
    partiallySupported: number;
    missingRequirements: number;
    unableToVerify: number;
    coveragePercentage: number;
  };
  findings: Phase7Finding[];
  requirementCoverage: RequirementCoverageItem[];
  warnings: string[];
  createdAt: string;
  completedAt?: string;
}

export interface AuditFixTask {
  id: string;
  projectId: string;
  auditId?: string;
  findingId: string;
  taskId?: string;
  title: string;
  fixPromptId?: string;
  fixStatus: "OPEN" | "FIX_PROMPT_READY" | "HANDED_OFF" | "AWAITING_VERIFICATION";
  targetAgent: string;
  contextPack?: Record<string, any>;
  promptText?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 8 — RE-AUDIT, VERIFICATION, REGRESSION & HEALTH
// ==========================================

export type VerificationStatus =
  | "RESOLVED"
  | "PARTIALLY_RESOLVED"
  | "STILL_PRESENT"
  | "REGRESSED"
  | "UNABLE_TO_VERIFY"
  | "NEEDS_MANUAL_REVIEW";

export type VerificationMethod =
  | "STATIC_ANALYSIS"
  | "CODE_REVIEW"
  | "TEST_EVIDENCE"
  | "STRUCTURAL_CHECK"
  | "SEMANTIC_ANALYSIS"
  | "USER_CONFIRMED"
  | "MANUAL_REVIEW";

export type VerificationScope =
  | "TARGETED_FINDING"
  | "FEATURE"
  | "AREA"
  | "FULL";

export type VerificationConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AuditVerification {
  id: string;
  projectId: string;
  findingId: string;
  auditId?: string;
  repositorySnapshotId?: string;
  verificationScope: VerificationScope;
  expectedBehavior: string;
  observedBehavior: string;
  originalEvidence: FindingEvidence;
  currentEvidence: FindingEvidence;
  verificationMethod: VerificationMethod;
  status: VerificationStatus;
  confidence: VerificationConfidence;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectHealthStatus =
  | "HEALTHY_WITHIN_SCOPE"
  | "NEEDS_ATTENTION"
  | "HIGH_RISK"
  | "INCOMPLETE"
  | "STALE"
  | "UNKNOWN";

export type BlueprintAlignmentStatus =
  | "ALIGNED"
  | "PARTIALLY_ALIGNED"
  | "DIFFERENT"
  | "UNKNOWN";

export interface ProjectHealthSnapshot {
  id: string;
  projectId: string;
  auditId?: string;
  repositorySnapshotId?: string;
  healthStatus: ProjectHealthStatus;
  healthScope: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  regressionCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  blueprintAlignment: BlueprintAlignmentStatus;
  metrics: {
    totalFindings: number;
    resolvedFindings: number;
    coveragePercentage: number;
    lastAuditTimestamp?: string;
    isStale: boolean;
    sharedDependencyWarnings?: string[];
    dimensionHealth?: Record<string, { status: string; findingCount: number }>;
  };
  recommendedNextAction?: string;
  createdAt: string;
}



