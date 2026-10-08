import assert from "node:assert";
import { runDeterministicChecks } from "../deterministic";
import { calculateRequirementCoverage } from "../coverage";
import { buildFixPromptForFinding } from "../fix-prompt";
import { runProjectAuditPipeline } from "../pipeline";
import {
  RepositorySnapshot,
  SoftwareBlueprint,
  RepositoryFile,
  RepositoryChunk,
  Phase7Finding,
} from "@/types";

export function runPhase7AuditTests() {
  console.log("Running Phase 7 Audit Engine & Evidence Test Suite...");

  // Mock repository snapshot
  const mockSnapshot: RepositorySnapshot = {
    id: "snap-test-1",
    project_id: "proj-1",
    status: "READY",
    file_count: 5,
    analyzed_file_count: 5,
    ignored_file_count: 0,
    is_active: true,
    warnings: [],
    errors: [],
    manifest: {
      projectName: "SaaS Platform",
      sourceType: "UPLOAD_FOLDER",
      architecture: {
        framework: "Next.js App Router",
        database: "Supabase PostgreSQL",
        authentication: "Supabase Auth",
        uiLibraries: ["Tailwind CSS"],
        testFrameworks: [],
        architecturePattern: "Full-Stack Server-Rendered",
        architectureConfidence: "CONFIRMED_BY_SOURCE",
        languages: ["TypeScript"],
        frameworkConfidence: "CONFIRMED_BY_SOURCE",
        databaseConfidence: "CONFIRMED_BY_SOURCE",
        authConfidence: "CONFIRMED_BY_SOURCE",
      },
      routes: [
        { path: "/api/orders/[id]", routeType: "API", filePath: "app/api/orders/[id]/route.ts" },
        { path: "/dashboard", routeType: "PAGE", filePath: "app/(dashboard)/page.tsx" },
      ],
      areas: [],
      majorDependencies: [{ name: "next", version: "15.1.7", role: "FRAMEWORK" }],
      existingCapabilities: [],
      driftObservations: [],
      duplicateWarnings: [],
      analysisQuality: {
        frameworkDetected: true,
        routesMapped: true,
        databaseDetected: true,
        authDetected: true,
        evidenceNotes: [],
      },
    },
    project_map: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock files with one sensitive file
  const mockFiles: RepositoryFile[] = [
    {
      id: "f-1",
      project_id: "proj-1",
      snapshot_id: "snap-test-1",
      path: ".env.production",
      extension: "production",
      size_bytes: 400,
      file_type: "CONFIG",
      importance: "CRITICAL",
      sensitivity: "CONFIRMED_SECRET",
      is_ignored: false,
      analysis_status: "ANALYZED",
      created_at: new Date().toISOString(),
    },
    {
      id: "f-2",
      project_id: "proj-1",
      snapshot_id: "snap-test-1",
      path: "app/api/orders/[id]/route.ts",
      extension: "ts",
      size_bytes: 1200,
      file_type: "API",
      importance: "HIGH",
      sensitivity: "NONE",
      is_ignored: false,
      analysis_status: "ANALYZED",
      created_at: new Date().toISOString(),
    },
  ];

  const mockChunks: RepositoryChunk[] = [
    {
      id: "c-1",
      project_id: "proj-1",
      snapshot_id: "snap-test-1",
      file_id: "f-2",
      file_path: "app/api/orders/[id]/route.ts",
      chunk_type: "ROUTE_HANDLER",
      start_line: 1,
      end_line: 30,
      content: `export async function GET(req: Request, { params }: { params: { id: string } }) {
        const order = await supabase.from('orders').select('*').eq('id', params.id).single();
        return Response.json(order);
      }`,
      character_count: 200,
      estimated_tokens: 50,
      content_hash: "hash123",
      created_at: new Date().toISOString(),
    },
  ];

  // Mock blueprint
  const mockBlueprint: Partial<SoftwareBlueprint> = {
    overview: {
      name: "SaaS Platform",
      summary: "Order management system",
      problemStatement: "Manage orders",
      valueProposition: "Easy ordering",
      productType: "B2B SaaS",
      targetOutcome: "Companies",
      status: "CONFIRMED",
      source: "USER_CONFIRMED",
    },
    features: [
      {
        id: "feat-1",
        title: "Order Tracking",
        simpleDescription: "Track order status",
        technicalDetails: "View order",
        category: "CORE_MVP",
        priority: "HIGH",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "feat-2",
        title: "AI Predictions",
        simpleDescription: "Predict inventory",
        technicalDetails: "Run AI",
        category: "FUTURE",
        priority: "LOW",
        source: "ASSUMED",
        status: "DEFERRED", // Should be ignored as post-MVP
      },
    ],
    screens: [
      {
        id: "screen-1",
        screenName: "Billing Overview",
        routePath: "/billing",
        simplePurpose: "Upgrade subscription",
        accessRoles: ["Admin"],
        keyComponents: [],
        emptyState: "",
        loadingState: "",
        errorState: "",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ],
    dataEntities: [
      {
        id: "entity-1",
        entityName: "Invoice",
        simpleDescription: "Customer invoices",
        ownershipRole: "Customer",
        attributes: [{ name: "id", type: "uuid", required: true, description: "ID" }],
        lifecycleStates: ["DRAFT", "PAID"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ],
  };

  // 1. Test deterministic check: secret detection
  const deterministicFindings = runDeterministicChecks({
    projectId: "proj-1",
    auditId: "audit-test",
    blueprint: mockBlueprint as SoftwareBlueprint,
    snapshot: mockSnapshot,
    files: mockFiles,
    symbols: [],
    chunks: mockChunks,
  });

  const secretFinding = deterministicFindings.find((f) => f.findingCode === "SEC-001");
  assert.ok(secretFinding, "SEC-001 must be triggered for exposed .env.production file");
  assert.strictEqual(secretFinding.severity, "CRITICAL");
  console.log("  [PASS] Secret exposure detected with CRITICAL severity.");

  // 2. Test deterministic check: IDOR / authorization check
  const authFinding = deterministicFindings.find((f) => f.findingCode === "AUTH-001");
  assert.ok(authFinding, "AUTH-001 must be triggered for /api/orders/[id] missing ownership check");
  assert.strictEqual(authFinding.category, "AUTHORIZATION");
  console.log("  [PASS] IDOR missing ownership check detected on parameterized route.");

  // 3. Test deterministic check: Missing screen detection
  const screenFinding = deterministicFindings.find((f) => f.findingCode === "UI-001");
  assert.ok(screenFinding, "UI-001 must be triggered for missing /billing screen");
  console.log("  [PASS] Missing planned screen identified with concrete path diff.");

  // 4. Test deterministic check: Missing data entity detection
  const dataFinding = deterministicFindings.find((f) => f.findingCode === "DATA-001");
  assert.ok(dataFinding, "DATA-001 must be triggered for missing Invoice entity");
  console.log("  [PASS] Missing planned data entity identified.");

  // 5. Test requirement coverage: deferred items excluded, active items mapped
  const coverage = calculateRequirementCoverage({
    projectId: "proj-1",
    auditId: "audit-test",
    blueprint: mockBlueprint as SoftwareBlueprint,
    snapshot: mockSnapshot,
  });

  const deferredItem = coverage.items.find((i) => i.title === "AI Predictions");
  assert.ok(deferredItem, "Deferred feature should be present in coverage items");
  assert.strictEqual(deferredItem.coverageStatus, "NOT_APPLICABLE");
  console.log("  [PASS] Deferred features marked NOT_APPLICABLE to respect MVP boundary.");

  // 6. Test fix prompt generation via Prompt Compiler conventions
  const sampleFinding: Phase7Finding = {
    id: "fnd-auth-1",
    projectId: "proj-1",
    auditId: "audit-test",
    findingCode: "AUTH-001",
    category: "AUTHORIZATION",
    severity: "HIGH",
    status: "ISSUE",
    title: "Missing ownership verification on order retrieval",
    summary: "Order can be accessed without ownership check.",
    description: "The handler queries orders by ID without filtering by user_id.",
    impact: "Potential IDOR vulnerability.",
    evidence: {
      filePath: "app/api/orders/[id]/route.ts",
      route: "/api/orders/[id]",
      snippet: mockChunks[0].content,
    },
    expectedBehavior: "Only the owning customer or an admin should access the order.",
    observedBehavior: "Direct lookup by ID without user ownership check.",
    recommendation: "Enforce user ownership filter on the database query.",
    verificationCriteria: [
      "Authorized customer can view their order",
      "Unauthorized customer receives 403 Forbidden",
    ],
    confidence: "HIGH",
    affectedFile: "app/api/orders/[id]/route.ts",
    fixStatus: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { promptText, fixTask } = buildFixPromptForFinding({
    projectId: "proj-1",
    finding: sampleFinding,
    targetAgent: "Antigravity",
    snapshot: mockSnapshot,
  });

  assert.ok(promptText.includes("AUTH-001"), "Prompt text must include finding code");
  assert.ok(promptText.includes("DO NOT CHANGE"), "Prompt text must enforce architecture preservation");
  assert.ok(promptText.includes("app/api/orders/[id]/route.ts"), "Prompt text must include exact target file");
  assert.strictEqual(fixTask.fixStatus, "FIX_PROMPT_READY");
  console.log("  [PASS] Targeted fix prompt compiled with architecture preservation directives.");

  console.log("ALL PHASE 7 UNIT TESTS PASSED!");
}
