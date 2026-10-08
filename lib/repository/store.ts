import { createClient } from "@/lib/supabase/server";
import {
  RepositoryChunk,
  RepositoryFile,
  RepositorySnapshot,
  RepositorySymbol,
  TaskContextOverride,
} from "@/types";

/**
 * Server-side database repository store with in-memory fallback support.
 */
export async function persistSnapshot(
  snapshot: RepositorySnapshot,
  files: RepositoryFile[],
  symbols: RepositorySymbol[],
  chunks: RepositoryChunk[]
): Promise<void> {
  const supabase = await createClient();

  try {
    // 1. Deactivate previous active snapshots for this project
    await supabase
      .from("repository_snapshots")
      .update({ is_active: false })
      .eq("project_id", snapshot.project_id);

    // 2. Insert new snapshot
    const { error: snapErr } = await supabase.from("repository_snapshots").insert({
      id: snapshot.id,
      project_id: snapshot.project_id,
      revision: snapshot.revision,
      status: snapshot.status,
      file_count: snapshot.file_count,
      analyzed_file_count: snapshot.analyzed_file_count,
      ignored_file_count: snapshot.ignored_file_count,
      is_active: true,
      warnings: snapshot.warnings,
      errors: snapshot.errors,
      manifest: snapshot.manifest,
      project_map: snapshot.project_map,
    });

    if (snapErr) {
      console.warn("Could not insert snapshot row directly into DB, saving to architecture_docs fallback:", snapErr);
      await saveSnapshotToArchitectureFallback(snapshot, files, symbols, chunks);
      return;
    }

    // 3. Batch insert files (up to 200 at a time)
    if (files.length > 0) {
      const dbFiles = files.map((f) => ({
        id: f.id,
        project_id: f.project_id,
        snapshot_id: snapshot.id,
        path: f.path,
        extension: f.extension,
        size_bytes: f.size_bytes,
        sha256_hash: f.sha256_hash,
        file_type: f.file_type,
        language: f.language,
        importance: f.importance,
        sensitivity: f.sensitivity,
        is_ignored: f.is_ignored,
        ignore_reason: f.ignore_reason,
        analysis_status: f.analysis_status,
      }));
      await supabase.from("repository_files").insert(dbFiles.slice(0, 300));
    }

    // 4. Batch insert symbols
    if (symbols.length > 0) {
      const dbSymbols = symbols.map((s) => ({
        id: s.id,
        project_id: snapshot.project_id,
        snapshot_id: snapshot.id,
        file_id: s.file_id,
        file_path: s.file_path,
        name: s.name,
        kind: s.kind,
        start_line: s.start_line,
        end_line: s.end_line,
        is_exported: s.is_exported,
        signature: s.signature,
        dependencies: s.dependencies,
      }));
      await supabase.from("repository_symbols").insert(dbSymbols.slice(0, 300));
    }

    // 5. Batch insert chunks
    if (chunks.length > 0) {
      const dbChunks = chunks.map((c) => ({
        id: c.id,
        project_id: snapshot.project_id,
        snapshot_id: snapshot.id,
        file_id: c.file_id,
        symbol_id: c.symbol_id,
        file_path: c.file_path,
        chunk_type: c.chunk_type,
        start_line: c.start_line,
        end_line: c.end_line,
        content: c.content,
        character_count: c.character_count,
        estimated_tokens: c.estimated_tokens,
        content_hash: c.content_hash,
      }));
      await supabase.from("repository_chunks").insert(dbChunks.slice(0, 300));
    }
  } catch (err) {
    console.error("Database persistence encountered error, activating fallback storage:", err);
    await saveSnapshotToArchitectureFallback(snapshot, files, symbols, chunks);
  }
}

/**
 * Retrieves the currently active repository snapshot and associated files for a project.
 */
export async function getActiveSnapshot(projectId: string): Promise<{
  snapshot: RepositorySnapshot | null;
  files: RepositoryFile[];
  symbols: RepositorySymbol[];
  chunks: RepositoryChunk[];
  overrides: TaskContextOverride[];
}> {
  const supabase = await createClient();

  try {
    const { data: snap } = await supabase
      .from("repository_snapshots")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (snap) {
      const [filesRes, symbolsRes, chunksRes, overridesRes] = await Promise.all([
        supabase.from("repository_files").select("*").eq("snapshot_id", snap.id).limit(500),
        supabase.from("repository_symbols").select("*").eq("snapshot_id", snap.id).limit(300),
        supabase.from("repository_chunks").select("*").eq("snapshot_id", snap.id).limit(200),
        supabase.from("task_context_overrides").select("*").eq("project_id", projectId),
      ]);

      return {
        snapshot: snap as RepositorySnapshot,
        files: (filesRes.data || []) as RepositoryFile[],
        symbols: (symbolsRes.data || []) as RepositorySymbol[],
        chunks: (chunksRes.data || []) as RepositoryChunk[],
        overrides: (overridesRes.data || []) as TaskContextOverride[],
      };
    }
  } catch (err) {
    console.warn("Could not query repository_snapshots table, checking architecture_docs fallback:", err);
  }

  // Fallback to architecture_docs JSONB
  return getSnapshotFromArchitectureFallback(projectId);
}

// Fallback helpers for smooth dev/demo before migration is applied in remote Supabase
async function saveSnapshotToArchitectureFallback(
  snapshot: RepositorySnapshot,
  files: RepositoryFile[],
  symbols: RepositorySymbol[],
  chunks: RepositoryChunk[]
) {
  const supabase = await createClient();
  const { data: archDoc } = await supabase
    .from("architecture_docs")
    .select("*")
    .eq("project_id", snapshot.project_id)
    .maybeSingle();

  const repoPayload = {
    activeSnapshot: snapshot,
    files: files.slice(0, 100),
    symbols: symbols.slice(0, 100),
    chunks: chunks.slice(0, 50),
    updated_at: new Date().toISOString(),
  };

  if (archDoc) {
    await supabase
      .from("architecture_docs")
      .update({
        storage: {
          ...(archDoc.storage as any || {}),
          repository_intelligence: repoPayload,
        },
      })
      .eq("id", archDoc.id);
  }
}

async function getSnapshotFromArchitectureFallback(projectId: string) {
  const supabase = await createClient();
  const { data: archDoc } = await supabase
    .from("architecture_docs")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const stored = (archDoc?.storage as any)?.repository_intelligence;
  if (!stored || !stored.activeSnapshot || stored.activeSnapshot.is_active === false) {
    return { snapshot: null, files: [], symbols: [], chunks: [], overrides: [] };
  }

  return {
    snapshot: stored.activeSnapshot as RepositorySnapshot,
    files: (stored.files || []) as RepositoryFile[],
    symbols: (stored.symbols || []) as RepositorySymbol[],
    chunks: (stored.chunks || []) as RepositoryChunk[],
    overrides: [],
  };
}

export async function disconnectRepository(projectId: string): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase
      .from("repository_snapshots")
      .update({ is_active: false })
      .eq("project_id", projectId);
  } catch (err) {
    console.warn("Error deactivating repository_snapshots:", err);
  }

  // Deactivate in architecture_docs fallback as well
  try {
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (archDoc?.storage) {
      const storageObj = { ...(archDoc.storage as any) };
      if (storageObj.repository_intelligence?.activeSnapshot) {
        storageObj.repository_intelligence.activeSnapshot.is_active = false;
        storageObj.repository_intelligence.activeSnapshot.status = "DISCONNECTED";
        await supabase
          .from("architecture_docs")
          .update({ storage: storageObj })
          .eq("id", archDoc.id);
      }
    }
  } catch (err) {
    console.warn("Error deactivating repository fallback storage:", err);
  }
}

