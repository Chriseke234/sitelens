import { ArchitectureConfidence, RepositoryProjectArea, RepositoryRoute } from "@/types";

/**
 * Maps Next.js and generic web application routes, APIs, and functional code areas.
 */
export function mapRoutesAndAreas(
  filePaths: string[]
): {
  routes: RepositoryRoute[];
  areas: RepositoryProjectArea[];
} {
  const routes: RepositoryRoute[] = [];
  const areaPathMap: Record<string, string[]> = {};

  for (const path of filePaths) {
    const p = path.replace(/\\/g, "/");
    const lower = p.toLowerCase();

    // Route detection: Next.js App Router (app/**/page.tsx, app/**/route.ts)
    if (lower.startsWith("app/") || lower.startsWith("src/app/")) {
      const isRouteHandler = lower.endsWith("/route.ts") || lower.endsWith("/route.js");
      const isPage = lower.endsWith("/page.tsx") || lower.endsWith("/page.jsx") || lower.endsWith("/page.js");
      const isLayout = lower.endsWith("/layout.tsx") || lower.endsWith("/layout.jsx");
      const isMiddleware = lower.endsWith("middleware.ts") || lower.endsWith("middleware.js");

      if (isRouteHandler || isPage || isLayout) {
        // Strip app/ and filename to get route path
        const cleaned = p
          .replace(/^(src\/)?app\//, "")
          .replace(/\/(route|page|layout)\.(tsx|jsx|ts|js)$/, "");
        
        // Remove route groups like (dashboard), (auth)
        const publicRoutePath = "/" + cleaned
          .split("/")
          .filter((segment) => !segment.startsWith("(") || !segment.endsWith(")"))
          .join("/");

        const normalizedPublicPath = publicRoutePath === "/page" || publicRoutePath === "" ? "/" : publicRoutePath;

        routes.push({
          path: normalizedPublicPath,
          filePath: p,
          routeType: isRouteHandler ? "API" : isLayout ? "LAYOUT" : "PAGE",
          httpMethods: isRouteHandler ? ["GET", "POST", "PUT", "DELETE", "PATCH"] : undefined,
          isProtected: lower.includes("dashboard") || lower.includes("admin") || lower.includes("projects"),
          authIndicator: lower.includes("auth") ? "auth_route" : undefined,
        });
      }

      if (isMiddleware) {
        routes.push({
          path: "/*",
          filePath: p,
          routeType: "MIDDLEWARE",
          isProtected: true,
          authIndicator: "Global edge session validation",
        });
      }
    }

    // High-level area grouping (Authentication, Tasks, Projects, Audits, Landing, Database, Config)
    if (lower.includes("auth") || lower.includes("login") || lower.includes("signup")) {
      (areaPathMap["Authentication & Identity"] ??= []).push(p);
    } else if (lower.includes("task") || lower.includes("planning")) {
      (areaPathMap["Task Planning Engine"] ??= []).push(p);
    } else if (lower.includes("prompt") || lower.includes("compiler")) {
      (areaPathMap["Prompt Studio & Compiler"] ??= []).push(p);
    } else if (lower.includes("blueprint") || lower.includes("build-map")) {
      (areaPathMap["Product Blueprint & Build Map"] ??= []).push(p);
    } else if (lower.includes("audit") || lower.includes("scoring")) {
      (areaPathMap["Audit & Assessment Engine"] ??= []).push(p);
    } else if (lower.includes("media")) {
      (areaPathMap["Media Authenticity Scanner"] ??= []).push(p);
    } else if (lower.includes("database") || lower.includes("supabase") || lower.includes("migration")) {
      (areaPathMap["Database & Data Layer"] ??= []).push(p);
    } else if (lower.includes("landing") || lower.includes("hero") || lower.includes("footer") || lower.includes("navbar")) {
      (areaPathMap["Landing & Marketing Surface"] ??= []).push(p);
    }
  }

  const areas: RepositoryProjectArea[] = Object.entries(areaPathMap).map(
    ([name, paths]) => ({
      name,
      category: "Feature Module",
      description: `Contains ${paths.length} file(s) responsible for ${name.toLowerCase()}.`,
      paths,
      confidence: "STRONGLY_INFERRED" as ArchitectureConfidence,
    })
  );

  return { routes, areas };
}
