import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadLatestAuditSnapshot } from "@/lib/audit/store";
import { AigenstraTask } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; findingId: string }> }
) {
  try {
    const { id, findingId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const audit = await loadLatestAuditSnapshot(id);
    const finding = audit?.findings.find((f) => f.id === findingId || f.findingCode === findingId);

    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    // Load tasks from architecture_docs storage
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", id)
      .single();

    const currentStorage = archDoc?.storage || {};
    const existingTasks: AigenstraTask[] = currentStorage.tasks || [];

    // Create new remediation task
    const taskId = `task-fix-${finding.findingCode.toLowerCase()}-${Date.now().toString(36)}`;
    const newTask: AigenstraTask = {
      id: taskId,
      project_id: id,
      title: `Fix ${finding.findingCode}: ${finding.title}`,
      short_description: finding.summary || finding.description,
      purpose: `Resolve audit finding ${finding.findingCode} (${finding.category})`,
      user_value: finding.impact,
      task_type: "BUG",
      category: finding.category,
      priority: finding.severity === "CRITICAL" ? "CRITICAL" : finding.severity === "HIGH" ? "HIGH" : "MEDIUM",
      status: "BACKLOG",
      readiness: "READY",
      complexity: "SMALL",
      source: "AUDIT_FINDING",
      stageNumber: 1,
      dependencies: [],
      blocked_by: [],
      related_blueprint_items: finding.sourceRequirement ? [finding.sourceRequirement] : [],
      related_engineering_items: [],
      related_decisions: [],
      related_assumptions: [],
      affected_screens: finding.affectedScreen ? [finding.affectedScreen] : [],
      affected_entities: [],
      affected_apis: finding.affectedFile ? [finding.affectedFile] : [],
      acceptance_criteria: finding.verificationCriteria,
      change_boundaries: {
        mustChange: finding.affectedFile ? [finding.affectedFile] : [],
        mayChange: [],
        mustNotChange: ["Authentication middleware", "Database RLS policies"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...existingTasks];

    await supabase
      .from("architecture_docs")
      .update({
        storage: {
          ...currentStorage,
          tasks: updatedTasks,
        },
      })
      .eq("project_id", id);

    return NextResponse.json({ success: true, task: newTask });
  } catch (err) {
    console.error("Convert finding to task error:", err);
    return NextResponse.json({ error: "Failed to create task from finding." }, { status: 500 });
  }
}
