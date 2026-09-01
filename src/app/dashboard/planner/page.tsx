import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PlannerForm } from "./PlannerForm";
import { ItineraryView } from "./ItineraryView";

export default async function PlannerPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const dailyLimit = Number(process.env.AI_PLANNER_DAILY_LIMIT || 5);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("feature", "trip_planner")
    .gte("created_at", since);

  const remaining = Math.max(dailyLimit - (count || 0), 0);

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / AI Trip Planner</div>
      <h1 className="font-display text-2xl mb-1">AI Trip Planner</h1>
      <p className="text-ink-soft text-sm mb-6">
        Tell us your trip, we&rsquo;ll build the day-by-day plan with a real AI call.
      </p>

      <PlannerForm remaining={remaining} dailyLimit={dailyLimit} />

      {(!itineraries || itineraries.length === 0) && (
        <p className="text-ink-soft text-sm text-center py-8">
          No itineraries yet — fill in the form above and generate your first one.
        </p>
      )}

      <div className="space-y-5">
        {(itineraries || []).map((it) => (
          <ItineraryView
            key={it.id}
            destination={it.destination}
            startDate={it.start_date}
            endDate={it.end_date}
            plan={it.plan_json as any}
          />
        ))}
      </div>
    </div>
  );
}
