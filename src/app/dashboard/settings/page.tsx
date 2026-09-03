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

  const integrations = [
    { name: "AI Trip Planner", provider: "Anthropic", configured: !!process.env.ANTHROPIC_API_KEY },
    { name: "Flights", provider: "Duffel", configured: !!process.env.DUFFEL_ACCESS_TOKEN },
    { name: "Billing", provider: "Paystack", configured: !!process.env.PAYSTACK_SECRET_KEY },
    { name: "Email reminders", provider: "Resend", configured: !!process.env.RESEND_API_KEY },
    { name: "Live visa data", provider: "RapidAPI", configured: !!process.env.RAPIDAPI_KEY },
  ];

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

      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-1">Integrations</h2>
        <p className="text-ink-faint text-xs mb-4">
          What&rsquo;s configured on this deployment. This only checks whether a key exists, not
          whether it&rsquo;s valid or has credit behind it.
        </p>
        <div className="space-y-2">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center justify-between py-1.5">
              <span className="text-sm">
                {i.name} <span className="text-ink-faint">· {i.provider}</span>
              </span>
              <span
                className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                  i.configured ? "bg-green-pale text-green-mid" : "bg-red-soft text-red"
                }`}
              >
                {i.configured ? "Configured" : "Not configured"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BillingPanel payments={payments || []} notifyEmail={profile?.notify_email ?? true} />
    </div>
  );
}
