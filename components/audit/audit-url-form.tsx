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
        <div className="mb-3 flex items-start gap-2.5 border-2 border-[#080808] bg-red-100 p-3 font-mono text-xs font-bold text-red-950 shadow-[2px_2px_0px_#080808]">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#080808]">
            <Globe className="h-4 w-4 stroke-[2.5]" />
          </div>
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            disabled={loading}
            className="w-full border-2 border-[#080808] bg-[#F8F6EC] py-2.5 pl-10 pr-4 font-mono text-xs font-bold text-[#080808] placeholder:text-[#080808]/40 shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 px-6">
          {loading ? (
            <>
              <Spinner size="sm" className="text-[#080808]" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 stroke-[2.5]" />
              <span>{buttonLabel}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
