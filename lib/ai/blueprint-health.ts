import { SoftwareBlueprint, BlueprintHealthReport, BlueprintHealthIssue } from "@/types";

/**
 * Validates internal consistency, completeness, and architectural soundness of a Software Blueprint.
 */
export function evaluateBlueprintHealth(blueprint: SoftwareBlueprint): BlueprintHealthReport {
  const issues: BlueprintHealthIssue[] = [];
  const strengths: string[] = [];

  let score = 100;

  // 1. Check Product Overview
  if (!blueprint.overview?.summary || blueprint.overview.summary.length < 20) {
    score -= 10;
    issues.push({
      id: "HEALTH-001",
      type: "ERROR",
      section: "Overview",
      message: "Product overview summary is missing or too brief.",
      recommendation: "Provide a clear 2-3 sentence overview of the product purpose.",
    });
  } else {
    strengths.push("Clear product value proposition and outcome defined.");
  }

  // 2. Check Users & Roles
  const roles = blueprint.usersRoles || [];
  if (roles.length === 0) {
    score -= 20;
    issues.push({
      id: "HEALTH-002",
      type: "ERROR",
      section: "Users & Roles",
      message: "No user roles defined.",
      recommendation: "Define at least one primary end-user role and an administrative role.",
    });
  } else {
    strengths.push(`${roles.length} distinct user roles mapped with permissions.`);
    
    // Check if roles have permissions defined
    roles.forEach((r) => {
      if (!r.technicalPermissions || r.technicalPermissions.length === 0) {
        score -= 5;
        issues.push({
          id: `HEALTH-ROLE-${r.id}`,
          type: "WARNING",
          section: "Users & Roles",
          message: `Role "${r.roleName}" has no technical permissions specified.`,
          recommendation: `Add explicit permissions (e.g. read/write access) for ${r.roleName}.`,
          affectedItemIds: [r.id],
        });
      }
    });
  }

  // 3. Check User Journeys
  const journeys = blueprint.userJourneys || [];
  if (journeys.length === 0) {
    score -= 15;
    issues.push({
      id: "HEALTH-003",
      type: "WARNING",
      section: "User Journeys",
      message: "No user journeys mapped yet.",
      recommendation: "Create at least one primary happy-path flow for main users.",
    });
  } else {
    strengths.push(`${journeys.length} end-to-end user journeys defined.`);
    journeys.forEach((j) => {
      if (!j.failureScenarios || j.failureScenarios.length === 0) {
        score -= 3;
        issues.push({
          id: `HEALTH-JOURNEY-${j.id}`,
          type: "SUGGESTION",
          section: "User Journeys",
          message: `Journey "${j.title}" is missing fallback/failure handling.`,
          recommendation: "Specify what happens when a user encounters a network or validation error.",
          affectedItemIds: [j.id],
        });
      }
    });
  }

  // 4. Check Pages & Screens
  const screens = blueprint.screens || [];
  if (screens.length === 0) {
    score -= 15;
    issues.push({
      id: "HEALTH-004",
      type: "ERROR",
      section: "Pages & Screens",
      message: "No screens or pages mapped.",
      recommendation: "Define the core screens needed to deliver the product experience.",
    });
  } else {
    strengths.push(`${screens.length} screens cataloged with states.`);
    screens.forEach((s) => {
      if (!s.emptyState || s.emptyState.trim() === "") {
        score -= 2;
        issues.push({
          id: `HEALTH-SCREEN-EMPTY-${s.id}`,
          type: "SUGGESTION",
          section: "Pages & Screens",
          message: `Screen "${s.screenName}" does not define an empty state.`,
          recommendation: "Specify what a first-time user sees before data is populated.",
          affectedItemIds: [s.id],
        });
      }
      if (!s.accessRoles || s.accessRoles.length === 0) {
        score -= 4;
        issues.push({
          id: `HEALTH-SCREEN-AUTH-${s.id}`,
          type: "WARNING",
          section: "Pages & Screens",
          message: `Screen "${s.screenName}" has no authorized roles assigned.`,
          recommendation: "Assign which user roles can access this page.",
          affectedItemIds: [s.id],
        });
      }
    });
  }

  // 5. Check Data Entities
  const entities = blueprint.dataEntities || [];
  if (entities.length === 0) {
    score -= 15;
    issues.push({
      id: "HEALTH-005",
      type: "ERROR",
      section: "Data Entities",
      message: "No data entities defined.",
      recommendation: "Define the core data models (e.g., User, Profile, Item, Order, Setting).",
    });
  } else {
    strengths.push(`${entities.length} data entities with attribute schemas.`);
    entities.forEach((e) => {
      if (!e.ownershipRole || e.ownershipRole.trim() === "") {
        score -= 3;
        issues.push({
          id: `HEALTH-ENTITY-${e.id}`,
          type: "WARNING",
          section: "Data Entities",
          message: `Data entity "${e.entityName}" does not specify an owner role.`,
          recommendation: "Define which role creates and manages this record to ensure RLS compliance.",
          affectedItemIds: [e.id],
        });
      }
    });
  }

  // 6. Check Features Matrix
  const features = blueprint.features || [];
  const coreMvpFeatures = features.filter((f) => f.category === "CORE_MVP");
  if (coreMvpFeatures.length === 0) {
    score -= 10;
    issues.push({
      id: "HEALTH-006",
      type: "WARNING",
      section: "Features Matrix",
      message: "No features categorized as Core MVP.",
      recommendation: "Designate essential first-release features as Core MVP.",
    });
  } else {
    strengths.push(`${coreMvpFeatures.length} Core MVP features isolated for initial build.`);
  }

  // 7. Check Security & Quality
  if (!blueprint.security || blueprint.security.length === 0) {
    score -= 10;
    issues.push({
      id: "HEALTH-007",
      type: "WARNING",
      section: "Security & Privacy",
      message: "Security rules not yet specified.",
      recommendation: "Add authentication, authorization, and data privacy safeguards.",
    });
  } else {
    strengths.push("Security and access control guidelines specified.");
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));
  const isReadyForBuild = finalScore >= 70 && !issues.some((i) => i.type === "ERROR");

  return {
    score: finalScore,
    issues,
    isReadyForBuild,
    strengths,
  };
}
