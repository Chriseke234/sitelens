import { ArchitectureConfidence, DetectedArchitecture } from "@/types";

export interface PackageManifest {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/**
 * Inspects package manifests, config files, and directory layouts to determine the tech stack.
 */
export function detectProjectArchitecture(
  filePaths: string[],
  packageJsonContent?: string
): DetectedArchitecture {
  let pkg: PackageManifest = {};
  if (packageJsonContent) {
    try {
      pkg = JSON.parse(packageJsonContent);
    } catch {
      // Ignore malformed JSON
    }
  }

  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const pathsLower = filePaths.map((p) => p.toLowerCase());

  // 1. Framework detection
  let framework = "Custom / Unknown";
  let frameworkConfidence: ArchitectureConfidence = "UNKNOWN";

  if (allDeps["next"] || pathsLower.some((p) => p.includes("next.config"))) {
    framework = "Next.js (App Router / React)";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["nuxt"] || pathsLower.some((p) => p.includes("nuxt.config"))) {
    framework = "Nuxt / Vue";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["@remix-run/react"] || allDeps["remix"]) {
    framework = "Remix";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["vite"] && allDeps["react"]) {
    framework = "React (Vite SPA)";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["express"]) {
    framework = "Express.js Node API";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["django"] || pathsLower.some((p) => p.endsWith("manage.py"))) {
    framework = "Django (Python)";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["fastapi"] || pathsLower.some((p) => p.includes("fastapi"))) {
    framework = "FastAPI (Python)";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (pathsLower.some((p) => p.endsWith("artisan"))) {
    framework = "Laravel (PHP)";
    frameworkConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["react"]) {
    framework = "React";
    frameworkConfidence = "STRONGLY_INFERRED";
  }

  // 2. Languages
  const languages: string[] = [];
  if (pathsLower.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"))) languages.push("TypeScript");
  if (pathsLower.some((p) => p.endsWith(".js") || p.endsWith(".jsx"))) languages.push("JavaScript");
  if (pathsLower.some((p) => p.endsWith(".py"))) languages.push("Python");
  if (pathsLower.some((p) => p.endsWith(".go"))) languages.push("Go");
  if (pathsLower.some((p) => p.endsWith(".rs"))) languages.push("Rust");
  if (pathsLower.some((p) => p.endsWith(".php"))) languages.push("PHP");
  if (pathsLower.some((p) => p.endsWith(".sql"))) languages.push("SQL");

  // 3. Package Manager
  let packageManager = "npm";
  if (pathsLower.some((p) => p.includes("pnpm-lock.yaml"))) packageManager = "pnpm";
  else if (pathsLower.some((p) => p.includes("yarn.lock"))) packageManager = "yarn";
  else if (pathsLower.some((p) => p.includes("bun.lockb"))) packageManager = "bun";

  // 4. Database
  let database = "None detected";
  let databaseConfidence: ArchitectureConfidence = "UNKNOWN";

  if (allDeps["@supabase/supabase-js"] || allDeps["@supabase/ssr"] || pathsLower.some((p) => p.includes("supabase/migrations"))) {
    database = "PostgreSQL (Supabase)";
    databaseConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["prisma"] || allDeps["@prisma/client"]) {
    database = "ORM (Prisma)";
    databaseConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["drizzle-orm"]) {
    database = "PostgreSQL / SQLite (Drizzle ORM)";
    databaseConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["pg"]) {
    database = "PostgreSQL";
    databaseConfidence = "STRONGLY_INFERRED";
  } else if (allDeps["mongoose"] || allDeps["mongodb"]) {
    database = "MongoDB";
    databaseConfidence = "CONFIRMED_BY_SOURCE";
  }

  // 5. Authentication
  let authentication = "None detected";
  let authConfidence: ArchitectureConfidence = "UNKNOWN";

  if (allDeps["@supabase/auth-helpers-nextjs"] || allDeps["@supabase/ssr"] || pathsLower.some((p) => p.includes("supabase/client") && p.includes("auth"))) {
    authentication = "Supabase Auth (JWT & Session Cookies)";
    authConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["next-auth"] || allDeps["@auth/core"]) {
    authentication = "NextAuth / Auth.js";
    authConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["@clerk/nextjs"] || allDeps["@clerk/clerk-react"]) {
    authentication = "Clerk";
    authConfidence = "CONFIRMED_BY_SOURCE";
  } else if (allDeps["firebase"] && pathsLower.some((p) => p.includes("auth"))) {
    authentication = "Firebase Auth";
    authConfidence = "CONFIRMED_BY_SOURCE";
  } else if (pathsLower.some((p) => p.includes("auth") || p.includes("session") || p.includes("jwt"))) {
    authentication = "Custom Session / Token Authentication";
    authConfidence = "POSSIBLY_INFERRED";
  }

  // 6. UI Libraries
  const uiLibraries: string[] = [];
  if (allDeps["tailwindcss"] || pathsLower.some((p) => p.includes("tailwind.config"))) uiLibraries.push("Tailwind CSS");
  if (allDeps["lucide-react"]) uiLibraries.push("Lucide Icons (SVG)");
  if (allDeps["@radix-ui/react-slot"] || pathsLower.some((p) => p.includes("components/ui"))) uiLibraries.push("shadcn/ui (Radix primitives)");
  if (allDeps["framer-motion"]) uiLibraries.push("Framer Motion");

  // 7. Test Frameworks
  const testFrameworks: string[] = [];
  if (allDeps["vitest"]) testFrameworks.push("Vitest");
  if (allDeps["jest"]) testFrameworks.push("Jest");
  if (allDeps["playwright"] || allDeps["@playwright/test"]) testFrameworks.push("Playwright");
  if (allDeps["cypress"]) testFrameworks.push("Cypress");

  // 8. Architecture pattern
  let architecturePattern = "Modular Application";
  let architectureConfidence: ArchitectureConfidence = "STRONGLY_INFERRED";

  if (framework.includes("Next.js")) {
    architecturePattern = "Full-Stack Server-Rendered (Next.js App Router + Server Components)";
    architectureConfidence = "CONFIRMED_BY_SOURCE";
  } else if (framework.includes("Express")) {
    architecturePattern = "Backend REST API (Node/Express)";
  } else if (framework.includes("Vite")) {
    architecturePattern = "Client-Side Single Page Application (SPA)";
  }

  return {
    framework,
    frameworkConfidence,
    languages: languages.length > 0 ? languages : ["TypeScript"],
    packageManager,
    database,
    databaseConfidence,
    authentication,
    authConfidence,
    apiPattern: framework.includes("Next.js") ? "Next.js Route Handlers (/api)" : "REST API",
    uiLibraries,
    testFrameworks,
    buildTool: framework.includes("Next.js") ? "Next.js Turbopack / Webpack" : "Vite / esbuild",
    architecturePattern,
    architectureConfidence,
  };
}
