import { RepositoryChunk, RepositorySymbol, SymbolKind } from "@/types";
import { redactSecrets } from "./secrets";

/**
 * Extracts top-level and exported functions, React components, hooks,
 * types, interfaces, and classes from TypeScript / JavaScript code.
 */
export function extractSymbolsAndChunks(
  filePath: string,
  content: string,
  snapshotId: string,
  fileId: string
): {
  symbols: RepositorySymbol[];
  chunks: RepositoryChunk[];
} {
  const symbols: RepositorySymbol[] = [];
  const chunks: RepositoryChunk[] = [];

  const lines = content.split("\n");
  const { redactedText } = redactSecrets(content);
  const redactedLines = redactedText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      continue;
    }

    let match: RegExpMatchArray | null = null;
    let kind: SymbolKind = "FUNCTION";
    let name = "";
    let isExported = trimmed.startsWith("export ");

    // 1. React Component / Hook / Function declaration
    if ((match = trimmed.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/))) {
      name = match[1];
      if (/^[A-Z]/.test(name)) kind = "COMPONENT";
      else if (name.startsWith("use") && name.length > 3) kind = "HOOK";
      else kind = "FUNCTION";
    }
    // 2. Const arrow function / component: const Foo = (...) => or const useFoo =
    else if ((match = trimmed.match(/^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(/))) {
      name = match[1];
      if (/^[A-Z]/.test(name)) kind = "COMPONENT";
      else if (name.startsWith("use") && name.length > 3) kind = "HOOK";
      else kind = "FUNCTION";
    }
    // 3. Class declaration
    else if ((match = trimmed.match(/^(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_]+)/))) {
      name = match[1];
      kind = "CLASS";
    }
    // 4. Interface
    else if ((match = trimmed.match(/^(?:export\s+)?interface\s+([A-Za-z0-9_]+)/))) {
      name = match[1];
      kind = "INTERFACE";
    }
    // 5. Type
    else if ((match = trimmed.match(/^(?:export\s+)?type\s+([A-Za-z0-9_]+)\s*=/))) {
      name = match[1];
      kind = "TYPE";
    }
    // 6. Next.js App Router HTTP handlers: export async function GET / POST / etc.
    else if ((match = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD)\s*\(/))) {
      name = match[1];
      kind = "ROUTE_HANDLER";
    }

    if (name) {
      const startLine = i + 1;
      // Approximate symbol bounds: look for balanced braces or take up to 40 lines
      const endLine = Math.min(lines.length, startLine + 35);
      const symbolId = `sym_${name}_${startLine}`;

      const symbolObj: RepositorySymbol = {
        id: symbolId,
        project_id: "",
        snapshot_id: snapshotId,
        file_id: fileId,
        file_path: filePath,
        name,
        kind,
        start_line: startLine,
        end_line: endLine,
        is_exported: isExported,
        signature: trimmed.slice(0, 120),
        dependencies: extractLocalImports(line),
        created_at: new Date().toISOString(),
      };
      symbols.push(symbolObj);

      // Create bounded structural chunk (using redacted content)
      const chunkSnippet = redactedLines.slice(startLine - 1, endLine).join("\n");
      const charCount = chunkSnippet.length;

      chunks.push({
        id: `chk_${name}_${startLine}`,
        project_id: "",
        snapshot_id: snapshotId,
        file_id: fileId,
        symbol_id: symbolId,
        file_path: filePath,
        chunk_type: kind,
        start_line: startLine,
        end_line: endLine,
        content: chunkSnippet,
        character_count: charCount,
        estimated_tokens: Math.ceil(charCount / 3.8),
        content_hash: `hash_${name}_${charCount}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return { symbols, chunks };
}

function extractLocalImports(line: string): string[] {
  const deps: string[] = [];
  const match = line.match(/from\s+["']([^"']+)["']/);
  if (match) {
    deps.push(match[1]);
  }
  return deps;
}
