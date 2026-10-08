import { RepositoryFile, RepositorySnapshot } from "@/types";

export interface SnapshotChangeDiff {
  addedFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
  unchangedFilesCount: number;
  affectedAreas: string[];
  hasStructuralChanges: boolean;
  staleTasksReason?: string;
}

/**
 * Detects incremental changes between two repository snapshots using sha256 file hashes.
 */
export function compareSnapshots(
  oldFiles: RepositoryFile[],
  newFiles: RepositoryFile[]
): SnapshotChangeDiff {
  const oldMap = new Map(oldFiles.map((f) => [f.path, f.sha256_hash]));
  const newMap = new Map(newFiles.map((f) => [f.path, f.sha256_hash]));

  const addedFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const deletedFiles: string[] = [];
  let unchangedFilesCount = 0;

  for (const [path, newHash] of newMap.entries()) {
    if (!oldMap.has(path)) {
      addedFiles.push(path);
    } else if (oldMap.get(path) !== newHash) {
      modifiedFiles.push(path);
    } else {
      unchangedFilesCount++;
    }
  }

  for (const path of oldMap.keys()) {
    if (!newMap.has(path)) {
      deletedFiles.push(path);
    }
  }

  const affectedAreas = new Set<string>();
  const changedPaths = [...addedFiles, ...modifiedFiles, ...deletedFiles];

  for (const p of changedPaths) {
    const lower = p.toLowerCase();
    if (lower.includes("auth") || lower.includes("middleware")) affectedAreas.add("Authentication");
    if (lower.includes("task") || lower.includes("planning")) affectedAreas.add("Task Planning");
    if (lower.includes("api/")) affectedAreas.add("API Layer");
    if (lower.includes("migration") || lower.includes("schema")) affectedAreas.add("Database Schema");
    if (lower.includes("components/")) affectedAreas.add("UI Components");
  }

  const hasStructuralChanges =
    changedPaths.some((p) => p.includes("package.json") || p.includes("schema") || p.includes("middleware.ts")) ||
    modifiedFiles.length > 5;

  return {
    addedFiles,
    modifiedFiles,
    deletedFiles,
    unchangedFilesCount,
    affectedAreas: Array.from(affectedAreas),
    hasStructuralChanges,
    staleTasksReason: hasStructuralChanges
      ? `${changedPaths.length} file(s) changed including core architectural files. Previous task context may be outdated.`
      : undefined,
  };
}
