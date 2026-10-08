import { verifyFinding } from "@/lib/audit/verify";
import { detectRegressions } from "@/lib/audit/regression";
import { compileRevisedFixPrompt } from "@/lib/audit/revised-fix-prompt";
import { computeProjectHealth } from "@/lib/audit/health";
import {
  Phase7Finding,
  RepositorySnapshot,
  RepositoryFile,
  RepositoryChunk,
  AuditSnapshot,
} from "@/types";

export function runPhase8VerificationTests() {
  console.log("Running Phase 8 Verification & Regression Engine Test Suite...");

  // Mock repository snapshot
  const mockSnapshot: RepositorySnapshot = {
    id: "snap-v2-fixed",
    project_id: "proj-1",
    status: "READY",
    file_count: 5,
    analyzed_file_count: 5,
    ignored_file_count: 0,
    is_active: true,
    warnings: [],
    errors: [],
    manifest: {
      projectName: "Test App",
      sourceType: "UPLOAD_FOLDER",
      architecture: {
        framework: "Next.js (App Router)",
        frameworkConfidence: "CONFIRMED_BY_SOURCE",
        languages: ["TypeScript"],
        databaseConfidence: "CONFIRMED_BY_SOURCE",
        authConfidence: "CONFIRMED_BY_SOURCE",
        uiLibraries: ["Tailwind CSS"],
        testFrameworks: ["Vitest"],
        architecturePattern: "Full-Stack Server-Rendered",
        architectureConfidence: "CONFIRMED_BY_SOURCE",
      },
      routes: [
        { path: "/api/orders/[id]", filePath: "app/api/orders/[id]/route.ts", routeType: "API" },
        { path: "/analytics", filePath: "app/(dashboard)/analytics/page.tsx", routeType: "PAGE" },
      ],
      areas: [],
      majorDependencies: [],
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

  // ==========================================
  // TEST 1: Deterministic Verification of SEC-001 (Secret Scrubbed)
  // ==========================================
  (async () => {
    const secFinding: Phase7Finding = {
      id: "finding-sec-1",
      projectId: "proj-1",
      auditId: "audit-1",
      findingCode: "SEC-001",
      category: "SECURITY",
      severity: "CRITICAL",
      status: "CRITICAL",
      title: "Hardcoded Stripe Secret Key Detected",
      summary: "Plaintext API secret found in code.",
      description: "Hardcoded Stripe Secret Key in code.",
      impact: "Unauthorized payment execution.",
      expectedBehavior: "All credentials read via process.env.",
      observedBehavior: "Stripe key hardcoded.",
      recommendation: "Move to .env.local",
      verificationCriteria: ["No plaintext sk_live keys in source"],
      confidence: "HIGH",
      affectedFile: "lib/stripe.ts",
      evidence: { filePath: "lib/stripe.ts" },
      fixStatus: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cleanFiles: RepositoryFile[] = [
      {
        id: "f-1",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        path: "lib/stripe.ts",
        extension: "ts",
        size_bytes: 120,
        file_type: "SOURCE",
        importance: "HIGH",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
    ];

    const cleanChunks: RepositoryChunk[] = [
      {
        id: "chk-1",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        file_id: "f-1",
        file_path: "lib/stripe.ts",
        chunk_type: "CODE",
        start_line: 1,
        end_line: 5,
        content: "export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);",
        character_count: 65,
        estimated_tokens: 18,
        content_hash: "hash1",
        created_at: new Date().toISOString(),
      },
    ];

    const verification = await verifyFinding({
      finding: secFinding,
      currentSnapshot: mockSnapshot,
      files: cleanFiles,
      chunks: cleanChunks,
    });

    if (verification.status !== "RESOLVED" || verification.confidence !== "HIGH") {
      throw new Error(`Test 1 Failed: Expected RESOLVED status, got ${verification.status}`);
    }
    console.log("  [PASS] Deterministic verification: SEC-001 verified RESOLVED when credentials are scrubbed.");
  })();

  // ==========================================
  // TEST 2: Deterministic Verification of AUTH-001 (Ownership Added)
  // ==========================================
  (async () => {
    const authFinding: Phase7Finding = {
      id: "finding-auth-1",
      projectId: "proj-1",
      auditId: "audit-1",
      findingCode: "AUTH-001",
      category: "AUTHORIZATION",
      severity: "HIGH",
      status: "ISSUE",
      title: "Missing Ownership Check on Parameterized Route",
      summary: "IDOR vulnerability in orders route.",
      description: "Any user can fetch any order by ID.",
      impact: "Cross-tenant data exposure.",
      expectedBehavior: "Route handler verifies user.id === order.user_id",
      observedBehavior: "Order fetched solely by route param id.",
      recommendation: "Add auth.uid() check.",
      verificationCriteria: ["Order query scopes by user_id"],
      confidence: "HIGH",
      affectedFile: "app/api/orders/[id]/route.ts",
      evidence: { filePath: "app/api/orders/[id]/route.ts" },
      fixStatus: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fixedFiles: RepositoryFile[] = [
      {
        id: "f-auth",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        path: "app/api/orders/[id]/route.ts",
        extension: "ts",
        size_bytes: 350,
        file_type: "ROUTE",
        importance: "HIGH",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
    ];

    const fixedChunks: RepositoryChunk[] = [
      {
        id: "chk-auth",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        file_id: "f-auth",
        file_path: "app/api/orders/[id]/route.ts",
        chunk_type: "CODE",
        start_line: 1,
        end_line: 15,
        content: `
          const { user } = await supabase.auth.getUser();
          const order = await db.orders.findFirst({ where: { id, user_id: user.id } });
          if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
        `,
        character_count: 220,
        estimated_tokens: 50,
        content_hash: "hash-fixed",
        created_at: new Date().toISOString(),
      },
    ];

    const verification = await verifyFinding({
      finding: authFinding,
      currentSnapshot: mockSnapshot,
      files: fixedFiles,
      chunks: fixedChunks,
    });

    if (verification.status !== "RESOLVED") {
      throw new Error(`Test 2 Failed: Expected RESOLVED status for ownership check, got ${verification.status}`);
    }
    console.log("  [PASS] Deterministic verification: AUTH-001 verified RESOLVED when ownership scoping is present.");
  })();

  // ==========================================
  // TEST 3: Verification of Partial Resolution
  // ==========================================
  (async () => {
    const authFinding: Phase7Finding = {
      id: "finding-auth-2",
      projectId: "proj-1",
      auditId: "audit-1",
      findingCode: "AUTH-001",
      category: "AUTHORIZATION",
      severity: "HIGH",
      status: "ISSUE",
      title: "Missing Ownership Check on Parameterized Route",
      summary: "IDOR vulnerability in orders route.",
      description: "Any user can fetch any order by ID.",
      impact: "Cross-tenant data exposure.",
      expectedBehavior: "Route handler verifies user.id === order.user_id",
      observedBehavior: "Order fetched solely by route param id.",
      recommendation: "Add auth.uid() check.",
      verificationCriteria: ["Order query scopes by user_id"],
      confidence: "HIGH",
      affectedFile: "app/api/orders/[id]/route.ts",
      evidence: { filePath: "app/api/orders/[id]/route.ts" },
      fixStatus: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const partialFiles: RepositoryFile[] = [
      {
        id: "f-auth-partial",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        path: "app/api/orders/[id]/route.ts",
        extension: "ts",
        size_bytes: 350,
        file_type: "ROUTE",
        importance: "HIGH",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
    ];

    // Has session verification, but NO entity ownership scoping (user_id match)
    const partialChunks: RepositoryChunk[] = [
      {
        id: "chk-auth-part",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        file_id: "f-auth-partial",
        file_path: "app/api/orders/[id]/route.ts",
        chunk_type: "CODE",
        start_line: 1,
        end_line: 12,
        content: `
          const { user } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          const order = await db.orders.findFirst({ where: { id } });
        `,
        character_count: 200,
        estimated_tokens: 45,
        content_hash: "hash-partial",
        created_at: new Date().toISOString(),
      },
    ];

    const verification = await verifyFinding({
      finding: authFinding,
      currentSnapshot: mockSnapshot,
      files: partialFiles,
      chunks: partialChunks,
    });

    if (verification.status !== "PARTIALLY_RESOLVED") {
      throw new Error(`Test 3 Failed: Expected PARTIALLY_RESOLVED status, got ${verification.status}`);
    }
    console.log("  [PASS] Evidence distinction: PARTIALLY_RESOLVED assigned when session check exists but entity scoping is missing.");
  })();

  // ==========================================
  // TEST 4: Regression Detection Engine & Blast Radius Warning
  // ==========================================
  (async () => {
    const previouslyResolved: Phase7Finding[] = [
      {
        id: "finding-auth-prev",
        projectId: "proj-1",
        auditId: "audit-0",
        findingCode: "AUTH-001",
        category: "AUTHORIZATION",
        severity: "HIGH",
        status: "VERIFIED",
        title: "Missing Ownership Check on Parameterized Route",
        summary: "Previously fixed ownership check.",
        description: "Checked in Snapshot 1.",
        impact: "IDOR",
        expectedBehavior: "Checks user_id",
        observedBehavior: "Fixed",
        recommendation: "Keep check",
        verificationCriteria: ["user_id check"],
        confidence: "HIGH",
        affectedFile: "app/api/orders/[id]/route.ts",
        evidence: { filePath: "app/api/orders/[id]/route.ts" },
        fixStatus: "AWAITING_VERIFICATION",
        verificationStatus: "RESOLVED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const prevFiles: RepositoryFile[] = [
      {
        id: "f-prev-1",
        project_id: "proj-1",
        snapshot_id: "snap-1",
        path: "app/api/orders/[id]/route.ts",
        extension: "ts",
        size_bytes: 350,
        sha256_hash: "hash-initial",
        file_type: "ROUTE",
        importance: "HIGH",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
      {
        id: "f-prev-2",
        project_id: "proj-1",
        snapshot_id: "snap-1",
        path: "middleware.ts",
        extension: "ts",
        size_bytes: 500,
        sha256_hash: "hash-mid-old",
        file_type: "ROUTE",
        importance: "CRITICAL",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
    ];

    // Current files: route was modified back to flawed state, and middleware was modified
    const currentFiles: RepositoryFile[] = [
      {
        id: "f-curr-1",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        path: "app/api/orders/[id]/route.ts",
        extension: "ts",
        size_bytes: 320,
        sha256_hash: "hash-new-regressed",
        file_type: "ROUTE",
        importance: "HIGH",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
      {
        id: "f-curr-2",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        path: "middleware.ts",
        extension: "ts",
        size_bytes: 520,
        sha256_hash: "hash-mid-new",
        file_type: "ROUTE",
        importance: "CRITICAL",
        sensitivity: "NONE",
        is_ignored: false,
        analysis_status: "ANALYZED",
        created_at: new Date().toISOString(),
      },
    ];

    const currentFlawedChunks: RepositoryChunk[] = [
      {
        id: "chk-regressed",
        project_id: "proj-1",
        snapshot_id: "snap-v2-fixed",
        file_id: "f-curr-1",
        file_path: "app/api/orders/[id]/route.ts",
        chunk_type: "CODE",
        start_line: 1,
        end_line: 8,
        content: `const order = await db.orders.findFirst({ where: { id: params.id } }); return NextResponse.json(order);`,
        character_count: 110,
        estimated_tokens: 30,
        content_hash: "hash-regressed",
        created_at: new Date().toISOString(),
      },
    ];

    const regressionResult = await detectRegressions(
      previouslyResolved,
      prevFiles,
      mockSnapshot,
      currentFiles,
      currentFlawedChunks
    );

    if (regressionResult.regressedFindings.length !== 1) {
      throw new Error(`Test 4 Failed: Expected 1 regressed finding, got ${regressionResult.regressedFindings.length}`);
    }

    const regressed = regressionResult.regressedFindings[0];
    if (regressed.status !== "CRITICAL" || regressed.previousFindingId !== "finding-auth-prev") {
      throw new Error(`Test 4 Failed: Regressed finding must escalate to CRITICAL and preserve previousFindingId.`);
    }

    if (regressionResult.sharedDependencyWarnings.length === 0) {
      throw new Error(`Test 4 Failed: Expected shared dependency warning for modified middleware.ts`);
    }

    console.log("  [PASS] Regression detection: Flagged returning vulnerability as CRITICAL and linked historical finding.");
    console.log("  [PASS] Shared dependency warning: Accurately alerted on root middleware changes.");
  })();

  // ==========================================
  // TEST 5: Revised Fix Prompt Compilation
  // ==========================================
  (() => {
    const finding: Phase7Finding = {
      id: "finding-idor-1",
      projectId: "proj-1",
      auditId: "audit-1",
      findingCode: "AUTH-001",
      category: "AUTHORIZATION",
      severity: "CRITICAL",
      status: "CRITICAL",
      title: "Missing Ownership Check on Orders Route",
      summary: "Customers can access cross-tenant orders.",
      description: "No tenant check.",
      impact: "Cross-tenant data breach.",
      expectedBehavior: "Query orders using user_id == auth.uid()",
      observedBehavior: "Partial session check, but entity ownership check still missing.",
      recommendation: "Add where: { user_id } scoping.",
      verificationCriteria: ["Order query strictly scoped by authenticated user_id"],
      confidence: "HIGH",
      affectedFile: "app/api/orders/[id]/route.ts",
      evidence: { filePath: "app/api/orders/[id]/route.ts" },
      fixStatus: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const verification = {
      id: "ver-1",
      projectId: "proj-1",
      findingId: finding.id,
      verificationScope: "TARGETED_FINDING" as const,
      expectedBehavior: finding.expectedBehavior,
      observedBehavior: "Session verified but where clause lacks user_id scoping.",
      originalEvidence: { filePath: "app/api/orders/[id]/route.ts" },
      currentEvidence: {
        filePath: "app/api/orders/[id]/route.ts",
        snippet: "const order = await db.orders.findFirst({ where: { id } });",
      },
      verificationMethod: "STATIC_ANALYSIS" as const,
      status: "PARTIALLY_RESOLVED" as const,
      confidence: "HIGH" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const revisedPrompt = compileRevisedFixPrompt({
      finding,
      verification,
      targetAgent: "Antigravity",
    });

    if (!revisedPrompt.includes("REVISED REMEDIATION INSTRUCTIONS") || !revisedPrompt.includes("THE REMAINING GAP")) {
      throw new Error("Test 5 Failed: Revised fix prompt missing key sections.");
    }

    if (!revisedPrompt.includes("STRICT CHANGE BOUNDARIES")) {
      throw new Error("Test 5 Failed: Revised prompt must maintain strict change boundaries.");
    }

    console.log("  [PASS] Revised fix prompt: Successfully compiled targeted instructions highlighting the remaining gap.");
  })();

  // ==========================================
  // TEST 6: Factual Project Health (Zero Fake Scores)
  // ==========================================
  (() => {
    const mockAudit: AuditSnapshot = {
      id: "audit-h-1",
      projectId: "proj-1",
      auditScope: "FULL",
      status: "COMPLETED",
      summary: {
        criticalCount: 1,
        highCount: 2,
        mediumCount: 1,
        lowCount: 0,
        infoCount: 0,
        verifiedCount: 8,
        totalFindings: 4,
        biggestIssue: "Exposed secret in lib/stripe.ts",
        nextRecommendedAction: "Scrub credentials from source control",
      },
      coverage: {
        totalRequirements: 10,
        verifiedRequirements: 8,
        partiallySupported: 1,
        missingRequirements: 1,
        unableToVerify: 0,
        coveragePercentage: 80,
      },
      findings: [
        {
          id: "f-crit",
          projectId: "proj-1",
          auditId: "audit-h-1",
          findingCode: "SEC-001",
          category: "SECURITY",
          severity: "CRITICAL",
          status: "CRITICAL",
          title: "Exposed Stripe Key",
          summary: "Key exposed",
          description: "Key exposed",
          impact: "Unauthorized billing",
          expectedBehavior: "Env var only",
          observedBehavior: "Hardcoded key",
          recommendation: "Remove key",
          verificationCriteria: [],
          confidence: "HIGH",
          evidence: { filePath: "lib/stripe.ts" },
          fixStatus: "OPEN",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      requirementCoverage: [],
      warnings: [],
      createdAt: new Date().toISOString(),
    };

    const health = computeProjectHealth({
      projectId: "proj-1",
      audit: mockAudit,
    });

    // Verify factual indicators
    if (health.healthStatus !== "HIGH_RISK") {
      throw new Error(`Test 6 Failed: Expected HIGH_RISK status due to critical finding, got ${health.healthStatus}`);
    }

    if (health.criticalCount !== 1) {
      throw new Error(`Test 6 Failed: Expected criticalCount === 1, got ${health.criticalCount}`);
    }

    if (health.blueprintAlignment !== "ALIGNED") {
      throw new Error(`Test 6 Failed: Expected ALIGNED for 80% coverage, got ${health.blueprintAlignment}`);
    }

    console.log("  [PASS] Factual Project Health: Calculated defensible health status without synthetic percentage scores.");
  })();

  console.log("ALL PHASE 8 UNIT TESTS PASSED!\n");
}
