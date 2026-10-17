import {
  DevelopmentPillarId,
  FeatureLifecycleState,
  FeatureStateRecord,
  ProductType,
  RepositorySnapshot,
  SharedProductDevelopmentRecord,
  SharedProductStandardPillar,
  SoftwareBlueprint,
  EngineeringBlueprint,
} from "@/types";

/**
 * Definition of the 12 core development pillars of the Aigenstra Shared Product Standard.
 */
export const STANDARD_PILLAR_DEFINITIONS: Record<
  DevelopmentPillarId,
  {
    title: string;
    description: string;
    defaultRisk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  }
> = {
  PROBLEM_AND_USERS: {
    title: "1. Problem Definition & Target Users",
    description: "Defines the core problem, user actors, pain points, and expected outcomes.",
    defaultRisk: "HIGH",
  },
  BUSINESS_AND_MONETIZATION: {
    title: "2. Business Model & Monetization",
    description: "Specifies pricing tiers, billing models, payment gateways, and trial/quota policies where applicable.",
    defaultRisk: "HIGH",
  },
  MVP_SCOPE_AND_PRIORITIZATION: {
    title: "3. MVP Scope & Feature Prioritization",
    description: "Separates essential Day-1 capabilities from post-launch enhancements to prevent bloat.",
    defaultRisk: "CRITICAL",
  },
  JOURNEYS_SCREENS_AND_STATES: {
    title: "4. User Journeys, Screens & Interaction States",
    description: "Maps user workflows, route paths, and explicit states: empty, loading, error, and success.",
    defaultRisk: "HIGH",
  },
  FUNCTIONAL_AND_NON_FUNCTIONAL_REQS: {
    title: "5. Functional & Non-Functional Requirements",
    description: "Defines system behaviors, constraints, uptime, latency, and business logic guarantees.",
    defaultRisk: "CRITICAL",
  },
  DATA_MODELS_AND_RELATIONSHIPS: {
    title: "6. Data Models & Relationships",
    description: "PostgreSQL schemas, foreign keys, cascades, constraints, and audit timestamps.",
    defaultRisk: "CRITICAL",
  },
  AUTH_AND_PERMISSIONS: {
    title: "7. Authentication, Authorization & Permissions",
    description: "Identity management, session validation, Role-Based Access Control (RBAC), and Row-Level Security (RLS).",
    defaultRisk: "CRITICAL",
  },
  APIS_AND_INTEGRATIONS: {
    title: "8. APIs, Integrations & Error Handling",
    description: "RESTful contracts, external webhooks, third-party SDKs, and structured HTTP error responses.",
    defaultRisk: "HIGH",
  },
  SECURITY_PRIVACY_AND_VALIDATION: {
    title: "9. Security, Privacy & Input Validation",
    description: "Zod server-side schemas, IDOR defense, SQL/script injection protection, and credential secrecy.",
    defaultRisk: "CRITICAL",
  },
  A11Y_RESPONSIVE_AND_PERFORMANCE: {
    title: "10. Accessibility, Responsive Design & Performance",
    description: "WCAG 2.1 AA compliance, 360px+ mobile to desktop fluid responsiveness, indexing, and fast LCP.",
    defaultRisk: "MEDIUM",
  },
  TESTING_AND_ACCEPTANCE: {
    title: "11. Testing, Acceptance Criteria & Release Readiness",
    description: "Executable integration tests, observable acceptance criteria, and typecheck verification.",
    defaultRisk: "HIGH",
  },
  DEPLOYMENT_AND_OPERATIONS: {
    title: "12. Deployment & Operational Requirements",
    description: "Environment isolation, build checks, database migrations, logs, and zero-downtime deployment.",
    defaultRisk: "MEDIUM",
  },
};

/**
 * Proportional depth adapter: determines whether a pillar is relevant and required for MVP
 * based on the product type, without forcing unnecessary bloat.
 */
export function adaptPillarForProductType(
  pillarId: DevelopmentPillarId,
  productType: ProductType
): { isRelevant: boolean; isRequiredForMvp: boolean; rationale: string } {
  switch (productType) {
    case "Landing Page":
      if (pillarId === "AUTH_AND_PERMISSIONS" || pillarId === "BUSINESS_AND_MONETIZATION") {
        return {
          isRelevant: false,
          isRequiredForMvp: false,
          rationale: "Landing pages focus on lead capture and conversion; auth and billing are bypassed unless custom accounts are explicitly requested.",
        };
      }
      if (pillarId === "A11Y_RESPONSIVE_AND_PERFORMANCE" || pillarId === "PROBLEM_AND_USERS") {
        return {
          isRelevant: true,
          isRequiredForMvp: true,
          rationale: "High conversion requires sub-second load speeds, mobile responsiveness (360px+), and clear value communication.",
        };
      }
      break;

    case "SaaS":
      if (pillarId === "AUTH_AND_PERMISSIONS" || pillarId === "DATA_MODELS_AND_RELATIONSHIPS") {
        return {
          isRelevant: true,
          isRequiredForMvp: true,
          rationale: "Multi-tenancy and data isolation via Supabase RLS are foundational security requirements for SaaS.",
        };
      }
      if (pillarId === "BUSINESS_AND_MONETIZATION") {
        return {
          isRelevant: true,
          isRequiredForMvp: true,
          rationale: "SaaS requires clear subscription tier gating (Free Bootstrap or Paid Scale).",
        };
      }
      break;

    case "E-commerce":
      if (pillarId === "BUSINESS_AND_MONETIZATION" || pillarId === "APIS_AND_INTEGRATIONS") {
        return {
          isRelevant: true,
          isRequiredForMvp: true,
          rationale: "Payment initiation, server-side callback verification, and order state machines are critical for e-commerce.",
        };
      }
      if (pillarId === "DATA_MODELS_AND_RELATIONSHIPS") {
        return {
          isRelevant: true,
          isRequiredForMvp: true,
          rationale: "Product variants, cart items, inventory counts, and order items require strict relational integrity.",
        };
      }
      break;

    default:
      break;
  }

  // Universal defaults
  const universalMvpPillars: Set<DevelopmentPillarId> = new Set([
    "PROBLEM_AND_USERS",
    "MVP_SCOPE_AND_PRIORITIZATION",
    "JOURNEYS_SCREENS_AND_STATES",
    "FUNCTIONAL_AND_NON_FUNCTIONAL_REQS",
    "DATA_MODELS_AND_RELATIONSHIPS",
    "SECURITY_PRIVACY_AND_VALIDATION",
    "TESTING_AND_ACCEPTANCE",
  ]);

  return {
    isRelevant: true,
    isRequiredForMvp: universalMvpPillars.has(pillarId),
    rationale: "Standard foundational software engineering requirement.",
  };
}

/**
 * Strict Three-Tier State Evaluator:
 * Evaluates whether a feature is:
 * - INTENDED_ONLY: In requirements/blueprint, no verified code evidence yet
 * - IMPLEMENTED_UNVERIFIED: Found in repository files/routes, but lacking test verification
 * - VERIFIED_WORKING: Confirmed through automated tests or runtime validation
 *
 * CRITICAL RULE: Never treats planned as implemented, or implemented as verified!
 */
export function evaluateFeatureLifecycleState(
  isPlanned: boolean,
  isCodeDetected: boolean,
  isTestVerified: boolean
): FeatureLifecycleState {
  if (!isPlanned && !isCodeDetected && !isTestVerified) {
    return "DEPRECATED_OR_DROPPED";
  }

  if (isTestVerified) {
    return "VERIFIED_WORKING";
  }

  if (isCodeDetected) {
    return "IMPLEMENTED_UNVERIFIED";
  }

  return "INTENDED_ONLY";
}

/**
 * Synthesizes a SharedProductDevelopmentRecord linking Intended, Actual, and Verified states.
 */
export function synthesizeSharedProductRecord(
  projectId: string,
  productType: ProductType,
  blueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null,
  repoSnapshot?: RepositorySnapshot | null,
  verifiedFindings?: Array<{ findingCode: string; status: string }>
): SharedProductDevelopmentRecord {
  const pillars: Record<DevelopmentPillarId, SharedProductStandardPillar> = {} as any;
  const featureStates: FeatureStateRecord[] = [];

  const allPillarKeys = Object.keys(STANDARD_PILLAR_DEFINITIONS) as DevelopmentPillarId[];

  for (const pillarId of allPillarKeys) {
    const meta = STANDARD_PILLAR_DEFINITIONS[pillarId];
    const adapt = adaptPillarForProductType(pillarId, productType);

    pillars[pillarId] = {
      id: pillarId,
      title: meta.title,
      description: meta.description,
      isRelevantForProject: adapt.isRelevant,
      relevanceRationale: adapt.rationale,
      requiredForMvp: adapt.isRequiredForMvp,
      intendedRequirements: [],
      actualEvidencedItems: [],
      verifiedItems: [],
      riskLevel: meta.defaultRisk,
    };
  }

  // Populate Intended Product from Software Blueprint
  if (blueprint?.features && Array.isArray(blueprint.features)) {
    for (const feat of blueprint.features) {
      const featId = feat.id || `feat_${featureStates.length + 1}`;
      const featTitle = feat.title || "Core Feature";
      const userValue = feat.simpleDescription || "";
      const isMvp = feat.category === "CORE_MVP" || feat.priority === "CRITICAL" || feat.priority === "HIGH";

      // Match against repository snapshot files and routes if available
      const routes = repoSnapshot?.manifest?.routes || [];
      const matchingRoutes = routes.filter((r) =>
        r.path.toLowerCase().includes(featTitle.toLowerCase().split(" ")[0])
      );
      const isDetectedInCode = matchingRoutes.length > 0;

      // Match against verified test executions / findings
      const isVerified = (verifiedFindings || []).some(
        (f) => f.status === "RESOLVED" && f.findingCode.includes(featId)
      );

      const lifecycleState = evaluateFeatureLifecycleState(true, isDetectedInCode, isVerified);

      featureStates.push({
        featureId: featId,
        featureTitle: featTitle,
        pillar: "MVP_SCOPE_AND_PRIORITIZATION",
        lifecycleState,
        intended: {
          specification: feat.technicalDetails || userValue,
          acceptanceCriteria: [
            `${featTitle} must be accessible on corresponding screens`,
            "Inputs must be validated with Zod",
            "Must adhere to Supabase RLS security policies",
          ],
          priority: feat.priority === "CRITICAL" ? "CRITICAL" : feat.priority === "HIGH" ? "HIGH" : "MEDIUM",
          belongsInMvp: isMvp,
          userValue,
          dependencies: [],
        },
        implementation: {
          isDetectedInCode,
          evidenceFiles: matchingRoutes.map((r) => r.filePath),
          evidenceRoutes: matchingRoutes.map((r) => r.path),
          evidenceTables: [],
          confidence: isDetectedInCode ? "CONFIRMED_BY_SOURCE" : "NOT_FOUND",
          notes: isDetectedInCode ? "Detected in repository manifest routes." : "No matching code route detected yet.",
        },
        verification: {
          isVerified,
          verifiedAt: isVerified ? new Date().toISOString() : undefined,
          verificationMethod: isVerified ? "AUTOMATED_TEST" : undefined,
          notes: isVerified ? "Confirmed via test execution." : "Awaiting test execution or verification pass.",
        },
      });
    }
  }

  // Summary Metrics
  const totalIntended = featureStates.length;
  const totalImplemented = featureStates.filter(
    (f) => f.lifecycleState === "IMPLEMENTED_UNVERIFIED" || f.lifecycleState === "VERIFIED_WORKING"
  ).length;
  const totalVerified = featureStates.filter((f) => f.lifecycleState === "VERIFIED_WORKING").length;
  const implementationGap = totalIntended - totalImplemented;
  const verificationGap = totalImplemented - totalVerified;
  const overallReadinessScore = totalIntended > 0 ? Math.round((totalVerified / totalIntended) * 100) : 0;

  return {
    projectId,
    productType,
    updatedAt: new Date().toISOString(),
    pillars,
    featureStates,
    summaryMetrics: {
      totalIntendedFeatures: totalIntended,
      totalImplementedFeatures: totalImplemented,
      totalVerifiedFeatures: totalVerified,
      implementationGapCount: Math.max(0, implementationGap),
      verificationGapCount: Math.max(0, verificationGap),
      overallReadinessScore,
    },
  };
}

/**
 * Formats a clean, token-efficient summary of the Shared Product Standard for inclusion
 * in coding agent prompts, highlighting intended vs implemented vs verified states.
 */
export function formatStandardGuidanceForPrompt(
  standard: SharedProductDevelopmentRecord
): string {
  const intendedCount = standard.summaryMetrics.totalIntendedFeatures;
  const implementedCount = standard.summaryMetrics.totalImplementedFeatures;
  const verifiedCount = standard.summaryMetrics.totalVerifiedFeatures;

  return `SHARED PRODUCT DEVELOPMENT STANDARD (THREE-TIER DISCIPLINE):
1. Intended Product (${intendedCount} features specified): Features planned in PRD/Blueprint.
2. Actual Implementation (${implementedCount} features detected): Code and routes verified to exist.
3. Verified State (${verifiedCount} features demonstrated working): Validated through automated tests or runtime checks.
RULE: Never treat a planned feature as implemented, or an implemented feature as verified without demonstrable tests.`;
}
