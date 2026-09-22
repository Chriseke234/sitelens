"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, User, Mail, Save } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || "");

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.full_name) {
            setFullName(profile.full_name);
          } else if (user.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setFetching(false);
      }
    }

    loadUserProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setErrorMessage("Full name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: userId,
          email,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setErrorMessage("Unable to update profile settings. Please try again.");
        setSaving(false);
        return;
      }

      // Also update auth user metadata for consistency
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });

      setSaveSuccess(true);
      setSaving(false);

      // Auto hide success badge after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch {
      setErrorMessage("An unexpected network error occurred while saving.");
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <Spinner size="md" />
        <p className="text-xs text-slate-500">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile information and account preferences.
        </p>
      </div>

      <Card className="max-w-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
          <CardDescription className="text-xs">
            Your name is displayed across your audit reports and account workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">Saved! Your profile has been updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {fullName || "User Account"}
                </p>
                <p className="text-xs text-slate-500">
                  Avatar upload will be available in organizational settings
                </p>
              </div>
            </div>

            {/* Email field (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address (Primary Account)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Email address modifications are locked for security verification.
              </p>
            </div>

            {/* Full Name field (Editable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-100 dark:focus:ring-slate-100"
                />
              </div>
            </div>

            <CardFooter className="px-0 pt-2 pb-0 flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Spinner size="sm" className="text-white dark:text-slate-900" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
