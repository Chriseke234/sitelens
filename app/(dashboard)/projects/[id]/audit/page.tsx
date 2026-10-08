"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuditDashboardView } from "@/components/projects/audit-dashboard-view";
import { AuditSnapshot } from "@/types";

export default function AuditPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditSnapshot | null>(null);
  const [hasConnectedRepo, setHasConnectedRepo] = useState(false);
  const [projectName, setProjectName] = useState("Project Workspace");

  const loadData = async () => {
    try {
      const [auditRes, repoRes, projectRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/audit`),
        fetch(`/api/projects/${projectId}/repository`),
        fetch(`/api/projects/${projectId}`),
      ]);

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        if (auditData.audit) setAudit(auditData.audit);
      }

      if (repoRes.ok) {
        const repoData = await repoRes.json();
        if (repoData.snapshot) setHasConnectedRepo(true);
      }

      if (projectRes.ok) {
        const pData = await projectRes.json();
        if (pData.name) setProjectName(pData.name);
      }
    } catch (err) {
      console.error("Failed to load audit page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AuditDashboardView
        projectId={projectId}
        projectName={projectName}
        initialAudit={audit}
        hasConnectedRepo={hasConnectedRepo}
        onRefresh={loadData}
      />
    </div>
  );
}
