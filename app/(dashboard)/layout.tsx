import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch application user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  const userProfile = {
    email: user.email || profile?.email || "",
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar userProfile={userProfile} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
