import { classifyInventoryItem } from "../inventory";
import { isIgnoredPath } from "../ignore-rules";
import { detectFileSensitivity, redactSecrets } from "../secrets";
import { detectProjectArchitecture } from "../detectors";
import { mapRoutesAndAreas } from "../routes";
import { extractSymbolsAndChunks } from "../symbols";
import { runRepositoryAnalysisPipeline } from "../pipeline";
import { RepositoryRoute } from "@/types";

export async function testPhase6RepositoryIntelligence() {
  console.log("Running Phase 6 Repository Intelligence Test Suite...");

  // 1. Test ignore rules
  if (!isIgnoredPath("node_modules/react/index.js")) throw new Error("Failed to ignore node_modules");
  if (!isIgnoredPath(".next/static/chunk.js")) throw new Error("Failed to ignore .next build dir");
  if (!isIgnoredPath("public/hero.png")) throw new Error("Failed to ignore binary image");
  if (isIgnoredPath("app/api/auth/route.ts")) throw new Error("Erroneously ignored critical route");
  console.log("  [PASS] Ignore rules correctly filter dependencies and binaries.");

  // 2. Test secrets detection and redaction
  const sens = detectFileSensitivity(".env.local", "DATABASE_URL=postgresql://postgres:secret123@localhost/db");
  if (sens === "NONE") throw new Error("Failed to identify sensitive config");

  const mockStripe = ["sk", "live", "mocktoken1234567890abcdef1234"].join("_");
  const rawSecrets = `const API_KEY = "${mockStripe}";\nconst JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc";`;
  const { redactedText, secretsCount } = redactSecrets(rawSecrets);
  if (secretsCount < 2) throw new Error(`Did not count all redacted secrets (got ${secretsCount})`);
  if (redactedText.includes(mockStripe) || redactedText.includes("eyJzdWIi")) {
    throw new Error("Secret leaked without redaction!");
  }
  console.log("  [PASS] Secret patterns detected and redacted cleanly.");

  // 3. Test static framework and architecture detectors
  const samplePaths = [
    "package.json",
    "app/(dashboard)/projects/[id]/page.tsx",
    "app/api/projects/[id]/route.ts",
    "lib/supabase/client.ts",
    "supabase/migrations/001_init.sql",
  ];
  const pkgJson = JSON.stringify({
    dependencies: {
      next: "15.1.7",
      react: "19.0.0",
      "@supabase/ssr": "0.5.2",
      tailwindcss: "3.4.17",
      "lucide-react": "0.475.0",
    },
  });

  const arch = detectProjectArchitecture(samplePaths, pkgJson);
  if (!arch.framework.includes("Next.js")) throw new Error("Failed to detect Next.js framework");
  if (!arch.database || !arch.database.includes("PostgreSQL")) throw new Error("Failed to detect Supabase PostgreSQL");
  if (arch.frameworkConfidence !== "CONFIRMED_BY_SOURCE") throw new Error("Framework confidence invalid");
  console.log("  [PASS] Static framework and architecture detection confirmed.");

  // 4. Test route mapping
  const { routes, areas } = mapRoutesAndAreas(samplePaths);
  if (routes.length < 2) throw new Error("Failed to map App Router routes");
  const apiRoute = routes.find((r: RepositoryRoute) => r.routeType === "API");
  if (!apiRoute || !apiRoute.path.includes("/api/projects")) throw new Error("Failed to map API route");
  console.log("  [PASS] App Router routes and feature areas mapped.");

  // 5. Test symbol and structural chunk extraction
  const sampleCode = `
    import { useState } from "react";
    export function UserProfileHeader() {
      return <div>Profile</div>;
    }
    export async function GET(req: Request) {
      return Response.json({ ok: true });
    }
  `;
  const { symbols, chunks } = extractSymbolsAndChunks("components/user.tsx", sampleCode, "snap_test", "file_test");
  if (symbols.length < 2) throw new Error("Failed to extract component and route symbols");
  if (chunks.length < 2) throw new Error("Failed to generate structural chunks");
  console.log("  [PASS] Symbol extraction and structural chunking verified.");

  // 6. Test full deterministic analysis pipeline
  const pipelineResult = runRepositoryAnalysisPipeline({
    projectId: "proj_unit_test",
    projectName: "Test App",
    sourceType: "UPLOAD_FOLDER",
    files: [
      { path: "package.json", size: 500, content: pkgJson },
      { path: "app/page.tsx", size: 800, content: "export default function Page() { return <h1>Home</h1>; }" },
      { path: "app/api/auth/route.ts", size: 600, content: "export async function POST() { return Response.json({}); }" },
    ],
    packageJsonContent: pkgJson,
  });

  if (pipelineResult.snapshot.status !== "READY") throw new Error("Pipeline snapshot not READY");
  if (pipelineResult.snapshot.manifest.routes.length === 0) throw new Error("Manifest routes missing");
  console.log("  [PASS] Full repository analysis pipeline executed successfully.");

  console.log("ALL PHASE 6 UNIT TESTS PASSED!");
}
