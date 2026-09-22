"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Search, Globe, AlertCircle } from "lucide-react";

interface AuditUrlFormProps {
  buttonLabel?: string;
  className?: string;
}

export function AuditUrlForm({
  buttonLabel = "Start Audit",
  className = "",
}: AuditUrlFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a website URL.");
      return;
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to start website audit.");
        setLoading(false);
        return;
      }

      if (data.auditId) {
        router.push(`/audits/${data.auditId}`);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {errorMessage && (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Globe className="h-4 w-4" />
          </div>
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-100 dark:focus:ring-slate-100"
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 px-6">
          {loading ? (
            <>
              <Spinner size="sm" className="text-white dark:text-slate-900" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>{buttonLabel}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
