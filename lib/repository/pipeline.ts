import {
  ConnectionSourceType,
  EngineeringBlueprint,
  RepositoryChunk,
  RepositoryFile,
  RepositoryManifest,
  RepositorySnapshot,
  RepositorySymbol,
  SoftwareBlueprint,
} from "@/types";
import { classifyInventoryItem, RawInputFile } from "./inventory";
import { detectProjectArchitecture } from "./detectors";
import { mapRoutesAndAreas } from "./routes";
import { extractSymbolsAndChunks } from "./symbols";
import { analyzeArchitectureDrift } from "./drift";

export interface AnalysisPipelineInput {
  projectId: string;
  projectName: string;
  sourceType: ConnectionSourceType;
  sourceReference?: string;
  branch?: string;
  revision?: string;
  files: RawInputFile[];
  packageJsonContent?: string;
  softwareBlueprint?: SoftwareBlueprint | null;
  engineeringBlueprint?: EngineeringBlueprint | null;
}

export interface AnalysisPipelineResult {
  snapshot: RepositorySnapshot;
  files: RepositoryFile[];
  symbols: RepositorySymbol[];
  chunks: RepositoryChunk[];
}

/**
 * Runs the deterministic static analysis pipeline for a project repository.
 * Zero external network calls or AI tokens required for baseline analysis.
 */
export function runRepositoryAnalysisPipeline(
  input: AnalysisPipelineInput
): AnalysisPipelineResult {
  const snapshotId = `snap_${Date.now()}`;
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Inventory & classification
  const inventoryItems = input.files.map((f) => classifyInventoryItem(f));
  const activePaths = inventoryItems.filter((i) => !i.isIgnored).map((i) => i.path);
  const ignoredCount = inventoryItems.filter((i) => i.isIgnored).length;

  if (activePaths.length === 0) {
    warnings.push("No analyzable source files found in repository upload.");
  }

  // 2. Architecture & Framework Detection
  const architecture = detectProjectArchitecture(activePaths, input.packageJsonContent);

  // 3. Routes & Functional Areas
  const { routes, areas } = mapRoutesAndAreas(activePaths);

  // 4. Symbols and Structural Chunks (for analyzed source files)
  const symbols: RepositorySymbol[] = [];
  const chunks: RepositoryChunk[] = [];
  const files: RepositoryFile[] = [];

  for (let idx = 0; idx < inventoryItems.length; idx++) {
    const item = inventoryItems[idx];
    const rawFile = input.files[idx];
    const fileId = `file_${idx}_${Date.now()}`;

    const repoFile: RepositoryFile = {
      id: fileId,
      project_id: input.projectId,
      snapshot_id: snapshotId,
      path: item.path,
      extension: item.extension,
      size_bytes: item.sizeBytes,
      sha256_hash: item.sha256Hash || `sha_${item.path}_${item.sizeBytes}`,
      file_type: item.fileType,
      language: item.language,
      importance: item.importance,
      sensitivity: item.sensitivity,
      is_ignored: item.isIgnored,
      ignore_reason: item.ignoreReason,
      analysis_status: item.isIgnored ? "SKIPPED" : "ANALYZED",
      created_at: new Date().toISOString(),
    };
    files.push(repoFile);

    // Extract symbols & structural chunks for non-ignored source files with content
    if (!item.isIgnored && rawFile?.content && (item.fileType === "SOURCE" || item.fileType === "COMPONENT" || item.fileType === "ROUTE" || item.fileType === "API")) {
      const extracted = extractSymbolsAndChunks(item.path, rawFile.content, snapshotId, fileId);
      symbols.push(...extracted.symbols);
      chunks.push(...extracted.chunks);
    }
  }

  // 5. Architecture Drift & Feature Mapping
  const { driftObservations, duplicateWarnings, existingCapabilities, featureMappings } =
    analyzeArchitectureDrift(architecture, activePaths, input.softwareBlueprint, input.engineeringBlueprint);

  // 6. Build Manifest
  const rawDeps = [
    { name: architecture.framework, role: "Application Framework" },
    { name: architecture.database || "None detected", role: "Data Persistence" },
    { name: architecture.authentication || "None detected", role: "Identity & Access" },
  ];
  const majorDependencies = rawDeps
    .filter((d) => Boolean(d.name) && !d.name.includes("None"))
    .map((d) => ({ name: d.name as string, role: d.role }));

  const manifest: RepositoryManifest = {
    projectName: input.projectName,
    sourceType: input.sourceType,
    sourceReference: input.sourceReference,
    branch: input.branch,
    revision: input.revision || `rev_${Date.now()}`,
    architecture,
    routes,
    areas,
    majorDependencies,
    existingCapabilities,
    driftObservations,
    duplicateWarnings,
    analysisQuality: {
      frameworkDetected: architecture.frameworkConfidence !== "UNKNOWN",
      routesMapped: routes.length > 0,
      databaseDetected: architecture.databaseConfidence !== "UNKNOWN",
      authDetected: architecture.authConfidence !== "UNKNOWN",
      evidenceNotes: [
        `Framework: ${architecture.framework} (${architecture.frameworkConfidence})`,
        `Mapped ${routes.length} route(s) and ${areas.length} feature area(s).`,
        `Identified ${existingCapabilities.length} existing capability system(s).`,
      ],
    },
  };

  const status = errors.length > 0 ? "FAILED" : warnings.length > 0 && activePaths.length === 0 ? "PARTIAL" : "READY";

  const snapshot: RepositorySnapshot = {
    id: snapshotId,
    project_id: input.projectId,
    revision: manifest.revision,
    status,
    file_count: input.files.length,
    analyzed_file_count: activePaths.length,
    ignored_file_count: ignoredCount,
    is_active: true,
    warnings,
    errors,
    manifest,
    project_map: {
      areas,
      routes,
      featureMappings,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    snapshot,
    files,
    symbols,
    chunks,
  };
}
