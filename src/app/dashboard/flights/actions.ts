"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { searchFlights, searchPlaces, type FlightSearchInput, type FlightOffer, type PlaceSuggestion } from "@/lib/duffel";

export interface FlightSearchState {
  offers?: FlightOffer[];
  error?: string;
}

export async function runFlightSearch(input: FlightSearchInput): Promise<FlightSearchState> {
  await requireUser();

  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    return { error: "Flight search isn't configured yet (DUFFEL_ACCESS_TOKEN missing)." };
  }

  try {
    const offers = await searchFlights(input);
    return { offers };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Flight search failed." };
  }
}

export async function lookupAirports(query: string): Promise<PlaceSuggestion[]> {
  await requireUser();
  if (!process.env.DUFFEL_ACCESS_TOKEN) return [];
  try {
    return await searchPlaces(query);
  } catch {
    return [];
  }
}

// Saves a chosen offer as a "held" booking row, a lightweight save, not a
// real ticket purchase (that would require actually creating a Duffel order).
export async function holdFlightOffer(input: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  priceNgn: number;
  offerId: string;
}) {
  const user = await requireUser();
  const supabase = createClient();

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    booking_type: "flight",
    provider: "duffel",
    origin: input.origin,
    destination: input.destination,
    depart_date: input.departDate,
    return_date: input.returnDate || null,
    price_ngn: input.priceNgn,
    status: "held",
    provider_reference: input.offerId,
  });

  if (error) throw error;
  revalidatePath("/dashboard/flights");
}
