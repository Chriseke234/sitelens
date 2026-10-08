import { FileClassificationType, FileImportance, FileSensitivity } from "@/types";
import { isIgnoredPath, getIgnoreReason } from "./ignore-rules";
import { detectFileSensitivity } from "./secrets";

export interface RawInputFile {
  path: string;
  size: number;
  content?: string;
  hash?: string;
}

export interface InventoryItem {
  path: string;
  extension: string;
  sizeBytes: number;
  sha256Hash?: string;
  fileType: FileClassificationType;
  language?: string;
  importance: FileImportance;
  sensitivity: FileSensitivity;
  isIgnored: boolean;
  ignoreReason?: string;
  analysisStatus: "PENDING" | "ANALYZED" | "SKIPPED" | "FAILED";
}

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript (React)",
  js: "JavaScript",
  jsx: "JavaScript (React)",
  mjs: "JavaScript",
  cjs: "JavaScript",
  py: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  java: "Java",
  php: "PHP",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  css: "CSS",
  scss: "SCSS",
  html: "HTML",
  sh: "Shell",
  env: "Environment",
};

/**
 * Classifies a raw file path and metadata into an inventory item.
 */
export function classifyInventoryItem(file: RawInputFile): InventoryItem {
  const normalizedPath = file.path.replace(/\\/g, "/").replace(/^\.?\//, "");
  const parts = normalizedPath.split(".");
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  const language = EXTENSION_LANGUAGE_MAP[extension] || undefined;

  const isIgnored = isIgnoredPath(normalizedPath);
  const ignoreReason = isIgnored ? getIgnoreReason(normalizedPath) : undefined;
  const sensitivity = detectFileSensitivity(normalizedPath, file.content);

  const fileType = determineFileType(normalizedPath, extension);
  const importance = determineFileImportance(fileType, normalizedPath);

  return {
    path: normalizedPath,
    extension,
    sizeBytes: file.size,
    sha256Hash: file.hash,
    fileType,
    language,
    importance,
    sensitivity,
    isIgnored,
    ignoreReason,
    analysisStatus: isIgnored ? "SKIPPED" : "PENDING",
  };
}

function determineFileType(path: string, ext: string): FileClassificationType {
  const p = path.toLowerCase();

  // Test files
  if (
    p.includes("__tests__") ||
    p.includes(".test.") ||
    p.includes(".spec.") ||
    p.startsWith("test/") ||
    p.startsWith("tests/")
  ) {
    return "TEST";
  }

  // Routes & APIs
  if (p.includes("/api/") || p.startsWith("api/") || p.includes("route.ts") || p.includes("route.js")) {
    return "API";
  }
  if (
    p.includes("/routes/") ||
    p.includes("page.tsx") ||
    p.includes("page.jsx") ||
    p.includes("layout.tsx") ||
    p.includes("layout.jsx") ||
    p.includes("middleware.ts")
  ) {
    return "ROUTE";
  }

  // Database / Schema
  if (
    p.includes("prisma/schema") ||
    p.includes("supabase/migrations") ||
    p.includes("migrations/") ||
    p.includes("models/") ||
    p.includes("entities/") ||
    p.includes("schema.ts") ||
    p.includes("schema.prisma") ||
    ext === "sql"
  ) {
    return "DATABASE";
  }

  // Components
  if (p.includes("components/") || p.includes("ui/") || ext === "tsx" || ext === "jsx") {
    return "COMPONENT";
  }

  // Config files
  if (
    p.endsWith("package.json") ||
    p.endsWith("tsconfig.json") ||
    p.includes("tailwind.config") ||
    p.includes("next.config") ||
    p.includes("vite.config") ||
    p.includes(".eslintrc") ||
    p.startsWith(".env") ||
    p.includes("docker")
  ) {
    return "CONFIG";
  }

  // Documentation
  if (ext === "md" || ext === "mdx" || ext === "txt" || p.includes("docs/")) {
    return "DOCUMENTATION";
  }

  // Assets
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "ico", "woff", "woff2", "ttf"].includes(ext)) {
    return "ASSET";
  }

  // Styles
  if (["css", "scss", "sass", "less"].includes(ext)) {
    return "STYLE";
  }

  // Scripts
  if (["sh", "bash", "ps1", "bat"].includes(ext) || p.startsWith("scripts/")) {
    return "SCRIPT";
  }

  // Source files
  if (["ts", "js", "py", "rs", "go", "rb", "php"].includes(ext)) {
    return "SOURCE";
  }

  return "UNKNOWN";
}

function determineFileImportance(fileType: FileClassificationType, path: string): FileImportance {
  const p = path.toLowerCase();
  if (
    fileType === "ROUTE" ||
    fileType === "API" ||
    fileType === "DATABASE" ||
    p.includes("auth") ||
    p.includes("middleware")
  ) {
    return "CRITICAL";
  }
  if (fileType === "COMPONENT" || fileType === "SOURCE") {
    return "HIGH";
  }
  if (fileType === "CONFIG" || fileType === "TEST") {
    return "MEDIUM";
  }
  return "LOW";
}
