import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { ApplicationTypeRow } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your passport and visa applications in one place.",
};

const STATUS_STYLES: Record<string, string> = {
  on_track: "bg-green-pale text-green-mid",
  in_progress: "bg-gold-soft text-[#8a6a1c]",
  action_needed: "bg-red-soft text-red",
  submitted: "bg-green-pale text-green-mid",
  approved: "bg-green-pale text-green-mid",
  rejected: "bg-red-soft text-red",
  not_started: "bg-line text-ink-faint",
};

const STATUS_LABEL: Record<string, string> = {
  on_track: "On Track",
  in_progress: "In Progress",
  action_needed: "Action Needed",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  not_started: "Not Started",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, completion_percent, application_type_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { count: documentCount } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // application_types is reference content: fetch the ones actually referenced
  let typesById: Record<string, ApplicationTypeRow> = {};
  if (applications && applications.length > 0) {
    const typeIds = [...new Set(applications.map((a) => a.application_type_id))];
    const { data: types } = await supabase
      .from("application_types")
      .select("*")
      .in("id", typeIds);
    typesById = Object.fromEntries((types || []).map((t) => [t.id, t]));
  }

  const activeCount = (applications || []).filter(
    (a) => a.status !== "approved" && a.status !== "rejected" && a.status !== "not_started"
  ).length;
  const firstName = (profile?.full_name || "there").split(" ")[0];

  return (
    <div>
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Welcome back, {firstName}</h1>
          <p className="text-ink-soft text-sm mt-1">
            Here&rsquo;s where every application and booking stands today.
          </p>
        </div>
        <Link
          href="/dashboard/visa"
          className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md"
        >
          + New Application
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Applications in progress" value={String(activeCount)} icon="▤" />
        <StatCard label="Documents in vault" value={String(documentCount ?? 0)} icon="▥" />
        <StatCard label="Total applications" value={String(applications?.length ?? 0)} icon="◷" />
        <StatCard label="Account status" value="Active" icon="✓" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div>
          <div className="bg-panel border border-line rounded-lg p-6 mb-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg">My Applications</h2>
            </div>

            {!applications || applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-ink-soft text-sm mb-4">
                  No applications yet. Start your Nigerian passport renewal or a visa application to
                  see it tracked here.
                </p>
                <Link
                  href="/dashboard/visa"
                  className="inline-block bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md"
                >
                  Start an application
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const type = typesById[app.application_type_id];
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 py-4 border-b border-line last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-pale text-green-deep flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                      {type?.destination || "NGP"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{type?.display_name || "Application"}</div>
                      <div className="w-full h-1.5 bg-green-pale rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-green-mid rounded-full"
                          style={{ width: `${app.completion_percent}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold font-mono uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                        STATUS_STYLES[app.status] || STATUS_STYLES.not_started
                      }`}
                    >
                      {STATUS_LABEL[app.status] || app.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-deep to-navy text-white rounded-lg p-6">
          <div className="font-mono text-[10.5px] tracking-widest uppercase text-gold-soft mb-2.5">
            AI Trip Planner
          </div>
          <h3 className="font-display text-lg mb-2">Plan your next trip</h3>
          <p className="text-sm text-white/75 mb-4">
            Tell us where you&rsquo;re headed and we&rsquo;ll build a day-by-day plan with flights, stays
            and a packing checklist.
          </p>
          <Link
            href="/dashboard/planner"
            className="inline-block bg-gold text-navy font-bold text-sm px-4.5 py-2.5 rounded-md"
          >
            Generate itinerary
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-panel border border-line rounded-lg p-5">
      <div className="w-9 h-9 rounded-lg bg-green-pale text-green-deep flex items-center justify-center text-base mb-3.5">
        {icon}
      </div>
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-ink-soft mt-1">{label}</div>
    </div>
  );
}
