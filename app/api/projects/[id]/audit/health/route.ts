import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSnapshot } from "@/lib/repository/store";
import { loadLatestAuditSnapshot } from "@/lib/audit/store";
import { loadLatestHealthSnapshot, saveHealthSnapshot } from "@/lib/audit/verification-store";
import { computeProjectHealth } from "@/lib/audit/health";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const health = await loadLatestHealthSnapshot(projectId);

    if (health) {
      return NextResponse.json({ health });
    }

    // Compute on-the-fly if not saved yet
    const audit = await loadLatestAuditSnapshot(projectId);
    const repoData = await getActiveSnapshot(projectId);
    const snapshot = repoData?.snapshot;

    if (!audit) {
      return NextResponse.json({
        health: {
          healthStatus: "UNKNOWN",
          healthScope: "NONE",
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          regressionCount: 0,
          verifiedCount: 0,
          unverifiedCount: 0,
          blueprintAlignment: "UNKNOWN",
          metrics: {
            totalFindings: 0,
            resolvedFindings: 0,
            coveragePercentage: 0,
            isStale: false,
          },
          recommendedNextAction: "Run an initial project audit to evaluate health.",
        },
      });
    }

    const computed = computeProjectHealth({
      projectId,
      audit,
      snapshot: snapshot || undefined,
    });

    await saveHealthSnapshot(computed);

    return NextResponse.json({ health: computed });
  } catch (err) {
    console.error("Health API GET error:", err);
    return NextResponse.json({ error: "Failed to load project health." }, { status: 500 });
  }
}
