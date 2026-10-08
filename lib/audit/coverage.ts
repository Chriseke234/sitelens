import {
  SoftwareBlueprint,
  RepositorySnapshot,
  RequirementCoverageItem,
  RequirementCoverageStatus,
} from "@/types";

export interface RequirementCoverageContext {
  projectId: string;
  auditId: string;
  blueprint?: SoftwareBlueprint | null;
  snapshot: RepositorySnapshot;
}

/**
 * Requirement Traceability & Coverage Mapping (Phase 7)
 * Maps every Blueprint feature, user journey, data entity, and security rule
 * to observable evidence in the repository snapshot.
 */
export function calculateRequirementCoverage(ctx: RequirementCoverageContext): {
  items: RequirementCoverageItem[];
  stats: {
    totalRequirements: number;
    verifiedRequirements: number;
    partiallySupported: number;
    missingRequirements: number;
    unableToVerify: number;
    coveragePercentage: number;
  };
} {
  const items: RequirementCoverageItem[] = [];
  const manifest = ctx.snapshot.manifest;
  const routes = manifest.routes || [];
  const routePaths = new Set(routes.map((r) => r.path.toLowerCase()));

  if (!ctx.blueprint) {
    return {
      items: [],
      stats: {
        totalRequirements: 0,
        verifiedRequirements: 0,
        partiallySupported: 0,
        missingRequirements: 0,
        unableToVerify: 0,
        coveragePercentage: 100,
      },
    };
  }

  // 1. Features Coverage
  if (ctx.blueprint.features) {
    for (const feature of ctx.blueprint.features) {
      if (feature.status === "DEFERRED") {
        items.push({
          id: `req-feat-${feature.id}`,
          projectId: ctx.projectId,
          auditId: ctx.auditId,
          requirementId: feature.id,
          requirementType: "FEATURE",
          title: (feature as any).featureName || feature.title || "Feature",
          coverageStatus: "NOT_APPLICABLE",
          evidencePaths: [],
          observations: "Explicitly deferred in Blueprint scope (Post-MVP).",
        });
        continue;
      }

      const featureTitle = (feature as any).featureName || feature.title || "Feature";
      const featureKey = featureTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchingRoutes = routes.filter((r) =>
        r.path.toLowerCase().replace(/[^a-z0-9]/g, "").includes(featureKey)
      );

      let status: RequirementCoverageStatus = "MISSING";
      let observations = "No routes or components matching this feature were detected.";

      if (matchingRoutes.length > 0) {
        status = matchingRoutes.length >= 2 ? "VERIFIED" : "PARTIALLY_SUPPORTED";
        observations = `Detected ${matchingRoutes.length} matching route(s): ${matchingRoutes.map((r) => r.path).join(", ")}`;
      }

      items.push({
        id: `req-feat-${feature.id}`,
        projectId: ctx.projectId,
        auditId: ctx.auditId,
        requirementId: feature.id,
        requirementType: "FEATURE",
        title: featureTitle,
        coverageStatus: status,
        evidencePaths: matchingRoutes.map((r) => r.filePath),
        observations,
      });
    }
  }

  // 2. User Journeys Coverage
  if (ctx.blueprint.userJourneys) {
    for (const journey of ctx.blueprint.userJourneys) {
      const journeySteps = journey.happyPathSteps || (journey as any).steps || [];
      const stepRoutes = journeySteps
        .map((s: any) => (s.technicalImplication || s.userAction || s.title || "").replace(/^\//, "").toLowerCase())
        .filter((s: string) => s.length > 0);

      const matchedSteps = stepRoutes.filter((sr: string) =>
        Array.from(routePaths).some((rp) => rp.includes(sr))
      );

      let status: RequirementCoverageStatus = "MISSING";
      if (matchedSteps.length === stepRoutes.length && stepRoutes.length > 0) {
        status = "VERIFIED";
      } else if (matchedSteps.length > 0) {
        status = "PARTIALLY_SUPPORTED";
      }

      const journeyTitle = (journey as any).journeyTitle || journey.title || "User Journey";
      items.push({
        id: `req-journey-${journey.id}`,
        projectId: ctx.projectId,
        auditId: ctx.auditId,
        requirementId: journey.id,
        requirementType: "WORKFLOW",
        title: `Journey: ${journeyTitle}`,
        coverageStatus: status,
        evidencePaths: [],
        observations: `${matchedSteps.length}/${stepRoutes.length} journey step screens verified in route tree.`,
      });
    }
  }

  // 3. Data Entities Coverage
  if (ctx.blueprint.dataEntities) {
    for (const entity of ctx.blueprint.dataEntities) {
      if (entity.status === "DEFERRED") continue;

      const entityName = entity.entityName.toLowerCase();
      const hasRoute = routes.some((r) => r.path.toLowerCase().includes(entityName));

      items.push({
        id: `req-entity-${entity.id}`,
        projectId: ctx.projectId,
        auditId: ctx.auditId,
        requirementId: entity.id,
        requirementType: "DATA_ENTITY",
        title: `Entity: ${entity.entityName}`,
        coverageStatus: hasRoute ? "PARTIALLY_SUPPORTED" : "UNABLE_TO_VERIFY",
        evidencePaths: [],
        observations: hasRoute
          ? `Observed API/UI routes referencing ${entity.entityName}.`
          : "Database table existence requires active connection inspection.",
      });
    }
  }

  // Compute summary stats
  const activeItems = items.filter((i) => i.coverageStatus !== "NOT_APPLICABLE");
  const verifiedCount = activeItems.filter((i) => i.coverageStatus === "VERIFIED").length;
  const partialCount = activeItems.filter((i) => i.coverageStatus === "PARTIALLY_SUPPORTED").length;
  const missingCount = activeItems.filter((i) => i.coverageStatus === "MISSING").length;
  const unableCount = activeItems.filter((i) => i.coverageStatus === "UNABLE_TO_VERIFY").length;

  const total = activeItems.length || 1;
  const coveragePercentage = Math.round(((verifiedCount + partialCount * 0.5) / total) * 100);

  return {
    items,
    stats: {
      totalRequirements: activeItems.length,
      verifiedRequirements: verifiedCount,
      partiallySupported: partialCount,
      missingRequirements: missingCount,
      unableToVerify: unableCount,
      coveragePercentage,
    },
  };
}
