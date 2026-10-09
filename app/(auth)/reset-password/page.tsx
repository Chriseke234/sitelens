"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Lock, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage("Unable to update password. Your recovery session may have expired.");
        setLoading(false);
        return;
      }

      setResetSuccess(true);
      setLoading(false);
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="border-[3px] border-[#080808] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#080808] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-[#B7FF6A] text-[#080808] shadow-[3px_3px_0px_#080808]">
          <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h2 className="mt-4 font-mono text-2xl font-black uppercase text-[#080808]">Password Updated!</h2>
        <p className="mt-2 font-mono text-xs font-bold leading-relaxed text-[#080808]/80">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] py-3 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
          >
            <span>Sign In Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-[3px] border-[#080808] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#080808]">
      {/* Header */}
      <div className="text-center pb-6 border-b-2 border-[#080808]">
        <span className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
          RECOVERY
        </span>
        <h1 className="mt-3 font-mono text-2xl font-black uppercase text-[#080808] sm:text-3xl">
          Set New Password
        </h1>
        <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
          Enter a new secure password for your account
        </p>
      </div>

      <div className="pt-6">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 border-2 border-[#080808] bg-red-100 p-3 font-mono text-xs font-bold text-red-950 shadow-[3px_3px_0px_#080808]">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs font-black uppercase text-[#080808]">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]">
                <Lock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border-2 border-[#080808] bg-[#F8F6EC] py-2.5 pl-10 pr-3 font-mono text-xs font-bold text-[#080808] placeholder:text-[#080808]/40 shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs font-black uppercase text-[#080808]">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]">
                <Lock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full border-2 border-[#080808] bg-[#F8F6EC] py-2.5 pl-10 pr-3 font-mono text-xs font-bold text-[#080808] placeholder:text-[#080808]/40 shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] py-3 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#080808] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="text-[#080808]" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 border-t-2 border-[#080808] pt-4 text-center font-mono text-xs font-bold text-[#080808]/70">
        <Link href="/login" className="font-black text-[#080808] underline hover:bg-[#FFE500] px-1">
          Cancel and return to sign in
        </Link>
      </div>
    </div>
  );
}
