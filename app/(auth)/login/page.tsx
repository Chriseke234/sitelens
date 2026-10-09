"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Supabase sign in error:", error);
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Invalid email address or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Your email address has not been verified yet. Please check your inbox for the confirmation link.");
        } else {
          setErrorMessage(error.message || "Unable to sign in at this time. Please try again.");
        }
        setLoading(false);
        return;
      }

      window.location.href = redirectPath;
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="border-[3px] border-[#080808] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#080808]">
      {/* Top Tag & Title */}
      <div className="text-center pb-6 border-b-2 border-[#080808]">
        <span className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
          SECURE ACCESS
        </span>
        <h1 className="mt-3 font-mono text-2xl font-black uppercase text-[#080808] sm:text-3xl">
          Sign In
        </h1>
        <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
          Enter credentials to access your AI engineering workspaces
        </p>
      </div>

      <div className="pt-6">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 border-2 border-[#080808] bg-red-100 p-3 font-mono text-xs font-bold text-red-950 shadow-[3px_3px_0px_#080808]">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs font-black uppercase text-[#080808]">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]">
                <Mail className="h-4 w-4 stroke-[2.5]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full border-2 border-[#080808] bg-[#F8F6EC] py-2.5 pl-10 pr-3 font-mono text-xs font-bold text-[#080808] placeholder:text-[#080808]/40 shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-black uppercase text-[#080808]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] font-bold text-[#080808]/70 hover:underline hover:text-[#080808]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]">
                <Lock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 border-t-2 border-[#080808] pt-4 text-center font-mono text-xs font-bold text-[#080808]/70">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-black text-[#080808] underline hover:bg-[#FFE500] px-1"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
