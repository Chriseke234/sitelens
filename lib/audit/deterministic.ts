import {
  SoftwareBlueprint,
  EngineeringBlueprint,
  RepositorySnapshot,
  RepositoryFile,
  RepositorySymbol,
  RepositoryChunk,
  Phase7Finding,
  AuditDimension,
  FindingSeverityLevel,
  FindingState,
} from "@/types";

export interface DeterministicAuditContext {
  projectId: string;
  auditId: string;
  blueprint?: SoftwareBlueprint | null;
  engineeringBlueprint?: EngineeringBlueprint | null;
  snapshot: RepositorySnapshot;
  files: RepositoryFile[];
  symbols: RepositorySymbol[];
  chunks: RepositoryChunk[];
}

/**
 * Stage 1: Deterministic Audit Checks (Zero AI Tokens)
 * Evaluates structural facts, route existence, schema presence, auth boundaries,
 * test coverage evidence, and secret exposures strictly from static evidence.
 */
export function runDeterministicChecks(ctx: DeterministicAuditContext): Phase7Finding[] {
  const findings: Phase7Finding[] = [];
  const now = new Date().toISOString();

  const manifest = ctx.snapshot.manifest;
  const routes = manifest.routes || [];
  const routePaths = new Set(routes.map((r) => r.path));
  const filePaths = new Set(ctx.files.map((f) => f.path));

  // --------------------------------------------------------------------------
  // 1. SECURITY & SECRET EXPOSURE AUDIT
  // --------------------------------------------------------------------------
  const secretExposedFiles = ctx.files.filter(
    (f) => f.sensitivity === "CONFIRMED_SECRET" || f.sensitivity === "POSSIBLE_SECRET"
  );

  for (const sf of secretExposedFiles) {
    findings.push({
      id: `sec-exposed-${sf.id || Math.random().toString(36).substring(7)}`,
      projectId: ctx.projectId,
      auditId: ctx.auditId,
      findingCode: "SEC-001",
      category: "SECURITY",
      severity: sf.sensitivity === "CONFIRMED_SECRET" ? "CRITICAL" : "HIGH",
      status: "ISSUE",
      title: `Potential Secret or Sensitive Configuration Committed: ${sf.path}`,
      summary: `A file containing potential secrets or environment keys was found in repository tracking.`,
      description: `Static file inspection detected a sensitive configuration file (${sf.path}) that appears to contain credentials, private tokens, or secrets.`,
      impact: `If committed to a shared repository, sensitive API keys or credentials can be leaked to unauthorized parties.`,
      evidence: {
        filePath: sf.path,
        blueprintRef: "Security Architecture: Environment & Secret Isolation",
        observedDiff: `File is tracked with sensitivity level: ${sf.sensitivity}`,
      },
      expectedBehavior: `Sensitive files (.env, credentials) must be excluded from version control via .gitignore.`,
      observedBehavior: `The file '${sf.path}' is present in the repository file inventory.`,
      recommendation: `Add '${sf.path}' to .gitignore and rotate any exposed keys or tokens immediately.`,
      verificationCriteria: [
        `File is removed from repository tracking`,
        `Sensitive credentials are provided via secure environment injection only`,
      ],
      confidence: "HIGH",
      affectedFile: sf.path,
      sourceRequirement: "Blueprint Security: Zero Credential Exposure",
      fixStatus: "OPEN",
      createdAt: now,
      updatedAt: now,
    });
  }

  // --------------------------------------------------------------------------
  // 2. AUTHORIZATION & IDOR (Insecure Direct Object Reference) AUDIT
  // --------------------------------------------------------------------------
  // Scan API route handlers that handle entity identifiers: e.g. /api/[entity]/[id]
  const idRoutes = routes.filter(
    (r) => (r.routeType === "API" || (r as any).type === "API") && (r.path.includes("[id]") || r.path.includes("[slug]"))
  );

  for (const idRoute of idRoutes) {
    const routeChunks = ctx.chunks.filter((c) => {
      const p = c.file_path || (c as any).filePath || "";
      return p === idRoute.filePath || (idRoute.path && p.includes(idRoute.path));
    });
    const combinedCode = routeChunks.map((c) => c.content).join("\n");

    if (combinedCode) {
      // Check for user/owner isolation indicators
      const hasOwnershipCheck =
        /user_id\s*===|\.eq\(\s*["']user_id["']|auth\.uid\(\)|session\.user\.id|userId\s*===/i.test(
          combinedCode
        );
      const performsDbQuery =
        /from\s*\(|\.select\(|\.findUnique\(|\.findFirst\(|\.query\(/i.test(combinedCode);

      if (performsDbQuery && !hasOwnershipCheck) {
        findings.push({
          id: `authz-idor-${idRoute.path.replace(/[^a-zA-Z0-9]/g, "-")}`,
          projectId: ctx.projectId,
          auditId: ctx.auditId,
          findingCode: "AUTH-001",
          category: "AUTHORIZATION",
          severity: "HIGH",
          status: "NEEDS_REVIEW",
          title: `Potential Missing Ownership Verification on Route ${idRoute.path}`,
          summary: `The route retrieves resource data by ID without an observable check that the requesting user owns it.`,
          description: `The API handler at ${idRoute.filePath} queries records by route parameter ID, but static analysis did not find an explicit user ownership filter (e.g. user_id check).`,
          impact: `An authenticated user could potentially view or modify another user's records by guessing the identifier (Insecure Direct Object Reference).`,
          evidence: {
            filePath: idRoute.filePath,
            route: idRoute.path,
            lineRange: routeChunks[0]
              ? [
                  routeChunks[0].start_line ?? (routeChunks[0] as any).startLine ?? 1,
                  routeChunks[0].end_line ?? (routeChunks[0] as any).endLine ?? 1,
                ]
              : undefined,
            snippet: routeChunks[0]?.content.slice(0, 300),
            engineeringRef: "Engineering Blueprint: Multi-tenant Data Isolation",
          },
          expectedBehavior: `API endpoints retrieving private records must verify that the requesting user is the owner or has authorized role access before returning data.`,
          observedBehavior: `The handler at ${idRoute.filePath} retrieves records directly by identifier without observable user ownership validation.`,
          recommendation: `Enforce server-side ownership verification by filtering database queries with the authenticated user ID (or confirming Supabase RLS ownership).`,
          verificationCriteria: [
            `Authorized user can access their own resource`,
            `User requesting another user's resource receives 403 or 404 response`,
            `Unauthenticated request receives 401 Unauthorized`,
          ],
          confidence: "MEDIUM",
          affectedFile: idRoute.filePath,
          sourceRequirement: "Blueprint Security: User Resource Ownership Isolation",
          fixStatus: "OPEN",
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. DATABASE SCHEMA & PLANNED DATA ENTITIES AUDIT
  // --------------------------------------------------------------------------
  if (ctx.blueprint?.dataEntities && ctx.blueprint.dataEntities.length > 0) {
    const symbols = ctx.symbols;
    const knownSymbolNames = new Set(symbols.map((s) => s.name.toLowerCase()));

    for (const entity of ctx.blueprint.dataEntities) {
      if (entity.status === "DEFERRED") continue; // Respect deferred scope

      const entityNameLower = entity.entityName.toLowerCase();
      const entityPlural = `${entityNameLower}s`;

      // Check if schema, type, or database table exists
      const matchesSymbol =
        knownSymbolNames.has(entityNameLower) ||
        knownSymbolNames.has(entityPlural) ||
        symbols.some((s) => s.name.toLowerCase().includes(entityNameLower));

      const matchesRoute = routes.some((r) => r.path.toLowerCase().includes(entityNameLower));

      if (!matchesSymbol && !matchesRoute) {
        findings.push({
          id: `db-missing-${entity.id}`,
          projectId: ctx.projectId,
          auditId: ctx.auditId,
          findingCode: "DATA-001",
          category: "DATABASE",
          severity: "MEDIUM",
          status: "ISSUE",
          title: `Planned Data Entity '${entity.entityName}' Not Found in Implementation`,
          summary: `The product blueprint defines '${entity.entityName}', but no matching database model, schema, or type was detected.`,
          description: `Blueprint Data Entity '${entity.entityName}' (${entity.simpleDescription}) has no corresponding TypeScript type, Zod schema, or Prisma/Supabase table definition in the codebase.`,
          impact: `Features depending on '${entity.entityName}' cannot persist or manipulate this data entity.`,
          evidence: {
            blueprintRef: `Data Entity: ${entity.entityName}`,
            observedDiff: `No symbols or schema definitions matching '${entity.entityName}' found in symbol index.`,
          },
          expectedBehavior: `Planned data entity '${entity.entityName}' should be represented with a database table or TypeScript schema.`,
          observedBehavior: `No model, schema, or database table found for '${entity.entityName}'.`,
          recommendation: `Create database migration or TypeScript type definition for '${entity.entityName}' with planned attributes: ${entity.attributes.map((a) => a.name).join(", ")}.`,
          verificationCriteria: [
            `Schema or database table definition exists for '${entity.entityName}'`,
            `Model includes attributes: ${entity.attributes.map((a) => a.name).slice(0, 4).join(", ")}`,
          ],
          confidence: "HIGH",
          affectedFeature: entity.entityName,
          sourceRequirement: `Blueprint Data Layer: ${entity.entityName}`,
          fixStatus: "OPEN",
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. SCREEN & UI ROUTE COVERAGE AUDIT
  // --------------------------------------------------------------------------
  if (ctx.blueprint?.screens && ctx.blueprint.screens.length > 0) {
    for (const screen of ctx.blueprint.screens) {
      if (screen.status === "DEFERRED") continue; // Respect deferred MVP boundary

      // Check if route exists in Next.js App Router routes
      const screenPath = screen.routePath || (screen as any).path || "";
      const screenPathNormalized = screenPath.replace(/^\//, "").toLowerCase();
      const roles = (screen.accessRoles || []).join(", ") || (screen as any).targetRole || "All Users";
      const keyAction = (screen as any).keyAction || screen.simplePurpose || "Navigate";

      const hasMatchingRoute = routes.some((r) => {
        const norm = r.path.replace(/^\//, "").toLowerCase();
        return norm === screenPathNormalized || norm.includes(screenPathNormalized);
      });

      if (!hasMatchingRoute && screenPathNormalized !== "") {
        findings.push({
          id: `ui-missing-screen-${screen.id}`,
          projectId: ctx.projectId,
          auditId: ctx.auditId,
          findingCode: "UI-001",
          category: "UI",
          severity: "MEDIUM",
          status: "ISSUE",
          title: `Planned Screen '${screen.screenName}' (${screenPath}) is Missing`,
          summary: `The blueprint specifies a screen at ${screenPath}, but no route or page exists in the repository.`,
          description: `Planned screen '${screen.screenName}' intended for ${roles} role with key action '${keyAction}' was not detected in Next.js App Router pages.`,
          impact: `Users cannot navigate to or interact with '${screen.screenName}'.`,
          evidence: {
            blueprintRef: `Screen: ${screen.screenName} (${screenPath})`,
            observedDiff: `Route '${screenPath}' absent from detected App Router pages.`,
          },
          expectedBehavior: `Next.js page route should exist at 'app${screenPath}/page.tsx' or equivalent.`,
          observedBehavior: `No matching page file found for route path '${screenPath}'.`,
          recommendation: `Scaffold page component at 'app${screenPath}/page.tsx' supporting planned user actions.`,
          verificationCriteria: [
            `Route ${screenPath} is reachable and renders valid JSX`,
            `Page includes key action: ${keyAction}`,
          ],
          confidence: "HIGH",
          affectedScreen: screen.screenName,
          sourceRequirement: `Blueprint Screen: ${screen.screenName}`,
          fixStatus: "OPEN",
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. TESTING EVIDENCE AUDIT
  // --------------------------------------------------------------------------
  const testFiles = ctx.files.filter((f) => f.file_type === "TEST" || f.path.includes(".test.") || f.path.includes(".spec."));
  if (testFiles.length === 0) {
    findings.push({
      id: `test-no-tests-detected`,
      projectId: ctx.projectId,
      auditId: ctx.auditId,
      findingCode: "TEST-001",
      category: "TESTING",
      severity: "LOW",
      status: "NEEDS_REVIEW",
      title: "No Automated Test Suite Evidence Detected in Repository",
      summary: "No unit or integration test files were found in the connected project.",
      description: "Static inspection found 0 test files matching standard patterns (*.test.ts, *.spec.tsx, __tests__/). Automated test coverage is vital to prevent regressions as the product evolves.",
      impact: "Modifications by coding agents could silently break existing functionality without automated verification.",
      evidence: {
        observedDiff: "0 test files discovered in repository inventory.",
        engineeringRef: "Engineering Blueprint: Testing & Quality Strategy",
      },
      expectedBehavior: "Core workflows and critical business logic should have automated test coverage.",
      observedBehavior: "No automated test files found in repository inventory.",
      recommendation: "Introduce automated testing (e.g. Vitest, Jest, or custom unit tests) covering key business logic and security boundaries.",
      verificationCriteria: [
        "Test runner configured and executable",
        "At least one unit test suite created covering core workflows",
      ],
      confidence: "HIGH",
      sourceRequirement: "Blueprint Quality Target: Automated Testing",
      fixStatus: "OPEN",
      createdAt: now,
      updatedAt: now,
    });
  }

  // --------------------------------------------------------------------------
  // 6. AUTHENTICATION & SESSION FLOW AUDIT
  // --------------------------------------------------------------------------
  const hasAuthArchitecture = manifest.architecture.authentication !== "None Detected";
  const authRoutes = routes.filter((r) => r.path.toLowerCase().includes("auth") || r.path.toLowerCase().includes("login"));
  const hasMiddleware = filePaths.has("middleware.ts") || filePaths.has("src/middleware.ts");

  if (hasAuthArchitecture && authRoutes.length === 0 && !hasMiddleware) {
    findings.push({
      id: `auth-session-routes-missing`,
      projectId: ctx.projectId,
      auditId: ctx.auditId,
      findingCode: "AUTH-002",
      category: "AUTHENTICATION",
      severity: "MEDIUM",
      status: "NEEDS_REVIEW",
      title: "Authentication Configured But No Dedicated Auth Route or Middleware Found",
      summary: "Authentication dependencies are present, but route protection middleware and auth endpoints were not observed.",
      description: `Detected auth provider '${manifest.architecture.authentication}', but could not locate middleware.ts or dedicated auth endpoints in the route inventory.`,
      impact: "Unprotected private routes could be loaded without server-side session verification.",
      evidence: {
        engineeringRef: `Auth Provider: ${manifest.architecture.authentication}`,
        observedDiff: "Neither middleware.ts nor dedicated /api/auth routes observed in file inventory.",
      },
      expectedBehavior: "Authentication should include server-side middleware (middleware.ts) to protect private routes and refresh sessions.",
      observedBehavior: "No middleware.ts found in repository root.",
      recommendation: "Create Next.js middleware.ts to enforce session verification on private dashboard routes.",
      verificationCriteria: [
        "middleware.ts exists and intercepts private route navigation",
        "Unauthenticated access is redirected to login",
      ],
      confidence: "MEDIUM",
      sourceRequirement: "Blueprint Security: Authentication & Session Flow",
      fixStatus: "OPEN",
      createdAt: now,
      updatedAt: now,
    });
  }

  return findings;
}
