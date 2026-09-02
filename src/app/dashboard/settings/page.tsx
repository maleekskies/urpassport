import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { BillingPanel } from "./BillingPanel";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile, billing, and notification preferences.",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, phone, nin_hash, notify_email")
    .eq("id", user.id)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, purpose, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Settings</div>
      <h1 className="font-display text-2xl mb-1">Settings</h1>
      <p className="text-ink-soft text-sm mb-6">Manage your profile and account details.</p>

      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Profile</h2>
        <ProfileForm
          email={profile?.email || user.email || ""}
          fullName={profile?.full_name || ""}
          phone={profile?.phone ?? null}
          hasNinOnFile={!!profile?.nin_hash}
        />
      </div>

      <BillingPanel payments={payments || []} notifyEmail={profile?.notify_email ?? true} />
    </div>
  );
}
