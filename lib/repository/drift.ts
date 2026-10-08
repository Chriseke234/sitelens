import {
  ArchitectureDriftObservation,
  DetectedArchitecture,
  DuplicateSystemWarning,
  EngineeringBlueprint,
  RepositoryFeatureMapping,
  SoftwareBlueprint,
} from "@/types";

/**
 * Compares the Planned Software & Engineering Blueprints against the Actual Detected Repository.
 * Identifies architectural differences and potential duplicate system patterns without judging or overwriting.
 */
export function analyzeArchitectureDrift(
  actual: DetectedArchitecture,
  filePaths: string[],
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null
): {
  driftObservations: ArchitectureDriftObservation[];
  duplicateWarnings: DuplicateSystemWarning[];
  existingCapabilities: Array<{ capability: string; evidence: string; paths: string[] }>;
  featureMappings: RepositoryFeatureMapping[];
} {
  const driftObservations: ArchitectureDriftObservation[] = [];
  const duplicateWarnings: DuplicateSystemWarning[] = [];
  const existingCapabilities: Array<{ capability: string; evidence: string; paths: string[] }> = [];
  const featureMappings: RepositoryFeatureMapping[] = [];

  const pathsLower = filePaths.map((p) => p.toLowerCase());

  // 1. Detect existing capabilities
  const authPaths = filePaths.filter((p) => p.toLowerCase().includes("auth") || p.toLowerCase().includes("middleware"));
  if (authPaths.length > 0) {
    existingCapabilities.push({
      capability: "Authentication & Session Management",
      evidence: `Found ${actual.authentication} with ${authPaths.length} supporting route(s)/util(s).`,
      paths: authPaths.slice(0, 5),
    });
  }

  const dbPaths = filePaths.filter(
    (p) => p.toLowerCase().includes("supabase") || p.toLowerCase().includes("migration") || p.toLowerCase().includes("schema")
  );
  if (dbPaths.length > 0) {
    existingCapabilities.push({
      capability: "Database & Schema Layer",
      evidence: `Found ${actual.database} with schema/migration files in repository.`,
      paths: dbPaths.slice(0, 5),
    });
  }

  // 2. Drift: Planned vs Actual Database
  const plannedDb = engineeringBlueprint?.domains?.DATABASE?.[0]?.technicalSpecification || "";
  const actualDb = actual.database || "";
  if (plannedDb && actualDb && actualDb !== "None detected") {
    const isMismatch =
      (plannedDb.toLowerCase().includes("mongo") && actualDb.toLowerCase().includes("postgres")) ||
      (plannedDb.toLowerCase().includes("postgres") && actualDb.toLowerCase().includes("mongo"));

    if (isMismatch) {
      driftObservations.push({
        domain: "Database Layer",
        planned: plannedDb.slice(0, 100),
        actual: actualDb,
        differenceSummary: "Planned blueprint specifies a different database engine than detected in code.",
        implication: "Coding agents may generate conflicting queries or migrations if not aligned.",
        recommendation: "Preserve the existing codebase database or update the engineering blueprint.",
      });
    }
  }

  // 3. Duplicate System Warnings
  const hasSupabase = pathsLower.some((p) => p.includes("supabase"));
  const hasFirebase = pathsLower.some((p) => p.includes("firebase"));
  if (hasSupabase && hasFirebase) {
    duplicateWarnings.push({
      systemType: "BACKEND_SERVICE",
      systemsFound: ["Supabase", "Firebase"],
      warningMessage: "Both Supabase and Firebase configuration patterns detected in repository.",
      recommendation: "Verify whether this is intentional multi-cloud or legacy dead code before building new tasks.",
    });
  }

  // 4. Feature-to-Code Mapping
  if (softwareBlueprint?.features) {
    for (const feat of softwareBlueprint.features) {
      const titleTokens = feat.title.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
      const matchedPaths = filePaths.filter((path) => {
        const pLower = path.toLowerCase();
        return titleTokens.some((tok) => pLower.includes(tok));
      });

      if (matchedPaths.length > 0) {
        featureMappings.push({
          id: `map_${feat.id}`,
          project_id: "",
          snapshot_id: "",
          feature_key: feat.id,
          feature_title: feat.title,
          code_area: matchedPaths[0],
          related_paths: matchedPaths.slice(0, 5),
          confidence: matchedPaths.length > 2 ? "CONFIRMED_BY_SOURCE" : "STRONGLY_INFERRED",
          observation: `Implementation structure exists across ${matchedPaths.length} file(s).`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return {
    driftObservations,
    duplicateWarnings,
    existingCapabilities,
    featureMappings,
  };
}
