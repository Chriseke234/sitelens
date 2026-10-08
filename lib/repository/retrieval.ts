import {
  AigenstraTask,
  RepositoryChunk,
  RepositoryFile,
  RepositorySymbol,
  TaskContextOverride,
  TaskRelevantChunk,
  TaskRelevantFile,
  TaskRepositoryContext,
  RepositorySnapshot,
} from "@/types";

/**
 * Task-Aware Layered Retrieval Engine:
 * Traverses files, symbols, and structural chunks to assemble the minimal sufficient
 * repository context for a specific task.
 */
export function retrieveTaskRepositoryContext(
  task: AigenstraTask,
  snapshot: RepositorySnapshot,
  files: RepositoryFile[],
  symbols: RepositorySymbol[],
  chunks: RepositoryChunk[],
  overrides: TaskContextOverride[] = []
): TaskRepositoryContext {
  const relevantFiles: TaskRelevantFile[] = [];
  const excludedFiles: Array<{ filePath: string; reason: string }> = [];
  const relevantChunks: TaskRelevantChunk[] = [];

  const taskKeywords = [
    task.title,
    task.purpose,
    task.category,
    ...(task.affected_screens || []),
    ...(task.affected_entities || []),
    ...(task.affected_apis || []),
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .filter((w) => w.length > 2);

  const overrideMap = new Map(overrides.map((o) => [o.file_path, o]));

  for (const file of files) {
    if (file.is_ignored) continue;

    const override = overrideMap.get(file.path);

    // 1. Check for manual exclusion override
    if (override && override.override_action === "FORCE_EXCLUDE") {
      excludedFiles.push({
        filePath: file.path,
        reason: override.user_rationale || "Manually excluded by user override.",
      });
      continue;
    }

    // 2. Check for manual inclusion override
    if (override && (override.override_action === "FORCE_INCLUDE" || override.override_action === "MARK_IMPORTANT")) {
      relevantFiles.push({
        filePath: file.path,
        fileType: file.file_type,
        relevance: "DIRECT",
        reason: override.user_rationale || "Manually included via task context override.",
        confidence: "CONFIRMED_BY_SOURCE",
      });
      addFileChunks(file, chunks, relevantChunks, "Manual override requirement");
      continue;
    }

    // 3. Layered heuristic matching: Path & entity relationship
    const pLower = file.path.toLowerCase();
    let isDirect = false;
    let matchReason = "";

    // Exact matches with task change boundaries
    const isMustChange = task.change_boundaries?.mustChange?.some((m) =>
      pLower.includes(m.toLowerCase().replace(/\/$/, ""))
    );
    if (isMustChange && (file.file_type === "ROUTE" || file.file_type === "COMPONENT" || file.file_type === "API")) {
      isDirect = true;
      matchReason = "Target file matching task change boundaries.";
    }

    // Keyword relevance matches
    if (!isDirect) {
      const matchCount = taskKeywords.filter((k) => pLower.includes(k)).length;
      if (matchCount >= 2) {
        isDirect = true;
        matchReason = `Directly matches task functional entities (${matchCount} key terms).`;
      } else if (matchCount === 1) {
        relevantFiles.push({
          filePath: file.path,
          fileType: file.file_type,
          relevance: "RELATED",
          reason: "Contains related domain logic or supporting components.",
          confidence: "STRONGLY_INFERRED",
        });
        continue;
      }
    }

    if (isDirect) {
      relevantFiles.push({
        filePath: file.path,
        fileType: file.file_type,
        relevance: "DIRECT",
        reason: matchReason,
        confidence: "CONFIRMED_BY_SOURCE",
      });
      addFileChunks(file, chunks, relevantChunks, matchReason);
    } else {
      // Excluded
      if (excludedFiles.length < 8) {
        excludedFiles.push({
          filePath: file.path,
          reason: "Not part of the declared change boundaries or domain scope for this task.",
        });
      }
    }
  }

  return {
    snapshotId: snapshot.id,
    revision: snapshot.revision,
    detectedStack: `${snapshot.manifest.architecture.framework} (${snapshot.manifest.architecture.database})`,
    relevantFiles: relevantFiles.slice(0, 10),
    relevantChunks: relevantChunks.slice(0, 8),
    excludedFiles,
    existingCapabilitiesToPreserve: snapshot.manifest.existingCapabilities.map((c) => c.capability),
    driftObservations: snapshot.manifest.driftObservations,
    duplicateWarnings: snapshot.manifest.duplicateWarnings,
    warnings: snapshot.warnings,
    isSnapshotStale: snapshot.status === "STALE",
  };
}

function addFileChunks(
  file: RepositoryFile,
  allChunks: RepositoryChunk[],
  out: TaskRelevantChunk[],
  reason: string
) {
  const fileChunks = allChunks.filter((c) => c.file_path === file.path);
  for (const c of fileChunks.slice(0, 2)) {
    out.push({
      chunkId: c.id,
      filePath: c.file_path,
      symbolName: c.symbol_id,
      startLine: c.start_line,
      endLine: c.end_line,
      content: c.content,
      reason,
      estimatedTokens: c.estimated_tokens,
    });
  }
}
