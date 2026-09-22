"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error logging reporting service if available
    console.error("SiteLens Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h2>
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred while processing your request. Please try again.
        </p>

        {error.digest && (
          <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
            Error Digest ID: {error.digest}
          </p>
        )}

        <div className="pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
