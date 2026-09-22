import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditReportView } from "@/components/audit/audit-report-view";
import { AuditRecord, AuditIssue, AuditPage } from "@/types";

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: auditId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // 1. Fetch audit record verifying user ownership
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("*")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (auditError || !audit) {
    notFound();
  }

  // 2. Fetch audit page details
  const { data: pageDetail } = await supabase
    .from("audit_pages")
    .select("*")
    .eq("audit_id", auditId)
    .maybeSingle();

  // 3. Fetch audit issues
  const { data: issues } = await supabase
    .from("audit_issues")
    .select("*")
    .eq("audit_id", auditId)
    .order("created_at", { ascending: true });

  return (
    <AuditReportView
      initialAudit={audit as AuditRecord}
      pageDetail={pageDetail as AuditPage | null}
      initialIssues={(issues as AuditIssue[]) || []}
    />
  );
}
