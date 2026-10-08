/**
 * Ignored path filters and exclusion rules.
 * Safe defaults to exclude dependencies, build artifacts, caches, and large binary blobs.
 */

const DEFAULT_IGNORED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".cache",
  "coverage",
  ".turbo",
  ".vercel",
  ".vscode",
  ".idea",
  "venv",
  ".venv",
  "__pycache__",
  "target", // Rust/Maven
  "vendor", // PHP/Go
  "tmp",
  "temp",
];

const DEFAULT_IGNORED_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "tsconfig.tsbuildinfo",
  ".DS_Store",
  "Thumbs.db",
];

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "tiff",
  "pdf", "zip", "tar", "gz", "7z", "rar",
  "mp3", "mp4", "wav", "avi", "mov", "webm",
  "exe", "dll", "so", "dylib", "bin",
  "woff", "woff2", "ttf", "eot", "otf",
]);

/**
 * Checks whether a given relative file path should be ignored from analysis.
 */
export function isIgnoredPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const segments = normalized.split("/");

  // Check directories
  for (const dir of DEFAULT_IGNORED_DIRS) {
    if (segments.includes(dir)) {
      return true;
    }
  }

  // Check specific files
  const filename = segments[segments.length - 1];
  if (DEFAULT_IGNORED_FILES.map((f) => f.toLowerCase()).includes(filename)) {
    return true;
  }

  // Check binary extensions
  const parts = filename.split(".");
  if (parts.length > 1) {
    const ext = parts.pop()!;
    if (BINARY_EXTENSIONS.has(ext)) {
      return true;
    }
  }

  return false;
}

/**
 * Provides a user-facing reason why a file path was excluded.
 */
export function getIgnoreReason(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const segments = normalized.split("/");

  for (const dir of DEFAULT_IGNORED_DIRS) {
    if (segments.includes(dir)) {
      return `Excluded dependency or build output directory: ${dir}/`;
    }
  }

  const filename = segments[segments.length - 1];
  if (DEFAULT_IGNORED_FILES.map((f) => f.toLowerCase()).includes(filename)) {
    return "Excluded lockfile or build cache metadata.";
  }

  const parts = filename.split(".");
  if (parts.length > 1 && BINARY_EXTENSIONS.has(parts.pop()!)) {
    return "Binary asset excluded from textual code analysis.";
  }

  return "Ignored by project filtering rule.";
}
