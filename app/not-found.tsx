import Link from "next/link";
import { FileSearch, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <FileSearch className="h-6 w-6" />
        </div>

        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
          404 Error
        </span>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Page Not Found
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested resource could not be found or may have been moved.
        </p>

        <div className="pt-2">
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
