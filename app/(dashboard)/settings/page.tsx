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

      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });

      setSaveSuccess(true);
      setSaving(false);

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
      <div className="flex h-64 flex-col items-center justify-center space-y-3 font-mono">
        <Spinner size="md" className="text-[#080808]" />
        <p className="text-xs font-bold text-[#080808]/70">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="border-b-[3px] border-[#080808] pb-6">
        <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
          PREFERENCES
        </div>
        <h1 className="mt-3 font-mono text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
          Manage your personal profile information and account preferences.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Your name is displayed across your audit reports and account workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 border-2 border-[#080808] bg-red-100 p-3 font-mono text-xs font-bold text-red-950 shadow-[2px_2px_0px_#080808]">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2.5 border-2 border-[#080808] bg-[#B7FF6A] p-3 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
              <span>Saved! Your profile has been updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5 font-mono">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-[#FFE500] text-xl font-black text-[#080808] shadow-[3px_3px_0px_#080808]">
                {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black uppercase text-[#080808]">
                  {fullName || "User Account"}
                </p>
                <p className="text-[11px] font-bold text-[#080808]/60">
                  Avatar upload will be available in organizational settings
                </p>
              </div>
            </div>

            {/* Email field (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#080808]">
                Email Address (Primary Account)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]/60">
                  <Mail className="h-4 w-4 stroke-[2.5]" />
                </div>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full border-2 border-[#080808] bg-[#F8F6EC]/50 py-2.5 pl-10 pr-3 text-xs font-bold text-[#080808]/60 cursor-not-allowed shadow-[2px_2px_0px_#080808]"
                />
              </div>
              <p className="text-[10px] font-bold text-[#080808]/60">
                Email address modifications are locked for security verification.
              </p>
            </div>

            {/* Full Name field (Editable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#080808]">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#080808]">
                  <User className="h-4 w-4 stroke-[2.5]" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-[#080808] bg-[#F8F6EC] py-2.5 pl-10 pr-3 text-xs font-bold text-[#080808] placeholder:text-[#080808]/40 shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                />
              </div>
            </div>

            <CardFooter className="px-0 pt-4 pb-0 flex justify-end border-t-0 bg-transparent">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Spinner size="sm" className="text-[#080808]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 stroke-[2.5]" />
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
