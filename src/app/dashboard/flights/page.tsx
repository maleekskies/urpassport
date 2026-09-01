import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { FlightSearchClient } from "./FlightSearchClient";

export default async function FlightsPage() {
  const user = await requireUser();
  const supabase = createClient();

  // Visa-linked status: pull the user's in-progress visa applications so we
  // can warn them if they're searching flights to a country they don't
  // have a ready visa for yet.
  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, completion_percent, application_type_id, application_types(destination, display_name, category)")
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false });

  const { data: recentBookings } = await supabase
    .from("bookings")
    .select("id, origin, destination, depart_date, return_date, price_ngn, status, created_at")
    .eq("user_id", user.id)
    .eq("booking_type", "flight")
    .order("created_at", { ascending: false })
    .limit(5);

  const visaApplications = (applications || [])
    .filter((a: any) => a.application_types?.category === "visa")
    .map((a: any) => ({
      destination: a.application_types.destination as string,
      displayName: a.application_types.display_name as string,
      completionPercent: a.completion_percent as number,
      status: a.status as string,
    }));

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Flights</div>
      <h1 className="font-display text-2xl mb-1">Flights</h1>
      <p className="text-ink-soft text-sm mb-6">
        Search real fares and hold the ones worth planning around — powered by Amadeus.
      </p>
      <FlightSearchClient visaApplications={visaApplications} recentBookings={recentBookings || []} />
    </div>
  );
}
