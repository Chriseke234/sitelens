import {
  EngineeringBlueprint,
  EngineeringReadinessReport,
  EngineeringBlocker,
  TechnicalRecommendation,
} from "@/types";

/**
 * Analyzes engineering architecture readiness, surfaces actionable blockers,
 * identifies unresolved decisions, and models product change impact.
 */
export function evaluateEngineeringReadiness(
  blueprint: EngineeringBlueprint,
  recommendations: TechnicalRecommendation[]
): EngineeringReadinessReport {
  const blockers: EngineeringBlocker[] = [];
  const domainReadiness: Record<string, "READY" | "NEEDS_REVIEW" | "UNDECIDED" | "BLOCKED"> = {
    PRODUCT_ARCHITECTURE: "READY",
    UX_ARCHITECTURE: "READY",
    UI_ARCHITECTURE: "READY",
    FRONTEND: "READY",
    BACKEND: "READY",
    API_CONTRACTS: "READY",
    DATABASE: "READY",
    AUTHENTICATION: "READY",
    AUTHORIZATION: "READY",
    SECURITY: "READY",
    PERFORMANCE: "READY",
    ACCESSIBILITY: "READY",
    TESTING: "READY",
    DEPLOYMENT: "READY",
    SEO: "READY",
  };

  // 1. Check Unresolved Technical Recommendations
  const undecidedRecs = (recommendations || []).filter(
    (r) => r.status === "UNDECIDED" || r.status === "RECOMMENDED"
  );

  undecidedRecs.forEach((r) => {
    if (r.area === "DATABASE" && r.status === "UNDECIDED") {
      domainReadiness.DATABASE = "UNDECIDED";
      blockers.push({
        id: "BLOCKER_DB",
        title: "Database Strategy Undecided",
        description: "Primary database paradigm has not been confirmed.",
        severity: "CRITICAL",
        affectedDomain: "DATABASE",
        resolution: `Accept the recommended ${r.recommendedOption} or select an alternative in Technical Decisions.`,
      });
    }

    if (r.area === "AUTH" && r.status === "UNDECIDED") {
      domainReadiness.AUTHENTICATION = "UNDECIDED";
      blockers.push({
        id: "BLOCKER_AUTH",
        title: "Authentication Method Undecided",
        description: "User authentication mechanism requires confirmation before building login flows.",
        severity: "WARNING",
        affectedDomain: "AUTHENTICATION",
        resolution: `Confirm ${r.recommendedOption} as the authentication approach.`,
      });
    }

    if (r.area === "PAYMENTS" && r.status === "UNDECIDED") {
      domainReadiness.BACKEND = "NEEDS_REVIEW";
      blockers.push({
        id: "BLOCKER_PAYMENTS",
        title: "Payment Integration Strategy Pending",
        description: "Product requires transactions, but payment gateway selection is undecided.",
        severity: "WARNING",
        affectedDomain: "BACKEND",
        resolution: "Choose a payment provider (e.g. Stripe) or mark payments as deferred to Phase 2.",
      });
    }
  });

  // 2. Check API Contracts Completeness
  if (!blueprint.apiContracts || blueprint.apiContracts.length === 0) {
    domainReadiness.API_CONTRACTS = "NEEDS_REVIEW";
    blockers.push({
      id: "BLOCKER_API",
      title: "No Conceptual API Contracts Defined",
      description: "At least one API endpoint is needed to interface client actions with backend storage.",
      severity: "WARNING",
      affectedDomain: "API_CONTRACTS",
      resolution: "Define core CRUD API endpoints for primary resources.",
    });
  }

  // 3. Check Authorization & Row-Level Security
  const authDomainItems = blueprint.domains?.AUTHORIZATION || [];
  if (authDomainItems.length === 0) {
    domainReadiness.AUTHORIZATION = "NEEDS_REVIEW";
    blockers.push({
      id: "BLOCKER_RLS",
      title: "Data Authorization Policy Missing",
      description: "Explicit data ownership and Row-Level Security policies have not been defined.",
      severity: "CRITICAL",
      affectedDomain: "AUTHORIZATION",
      resolution: "Define ownership-based access control rules for sensitive user records.",
    });
  }

  // 4. Traceability Completeness
  if (!blueprint.traceabilityMatrix || blueprint.traceabilityMatrix.length === 0) {
    domainReadiness.PRODUCT_ARCHITECTURE = "NEEDS_REVIEW";
  }

  // 5. Overall Status
  let overallStatus: "READY" | "NEEDS_DECISIONS" | "BLOCKED" = "READY";
  if (blockers.some((b) => b.severity === "CRITICAL")) {
    overallStatus = "BLOCKED";
  } else if (undecidedRecs.length > 0 || blockers.length > 0) {
    overallStatus = "NEEDS_DECISIONS";
  }

  // 6. Change Impact Simulation Examples
  const changeImpacts = [
    {
      productChange: "Remove user account requirement (allow guest checkout / usage)",
      affectedEngineeringAreas: [
        "AUTHENTICATION: Session token verification disabled",
        "DATABASE: Make user_id foreign key nullable on primary entities",
        "AUTHORIZATION: Replace auth.uid() checks with anonymous session tokens or local storage",
        "FRONTEND: Remove login/signup redirect guards from core workflow",
      ],
      recommendation: "If switching to guest mode, implement temporary local storage caching with optional account conversion.",
    },
    {
      productChange: "Add multi-tenant team collaboration (multiple users per workspace)",
      affectedEngineeringAreas: [
        "DATABASE: Add workspaces & workspace_members tables with role enum",
        "AUTHORIZATION: Update RLS policies to check workspace membership instead of direct user_id",
        "BACKEND: Add invite generation, token verification, and seat limit validation",
        "FRONTEND: Add workspace switcher and team management settings tab",
      ],
      recommendation: "Introduce a clean workspace_id foreign key early across all core tables to prevent breaking migrations later.",
    },
  ];

  return {
    status: overallStatus,
    domainReadiness,
    blockers,
    unresolvedDecisionsCount: undecidedRecs.length,
    changeImpacts,
  };
}
