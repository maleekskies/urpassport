// Duffel Flights API client. Chosen after Amadeus's Self-Service portal was
// decommissioned (July 2026, no longer available to indie/self-serve
// developers). Duffel still offers instant self-serve signup with a free
// test-mode token (duffel_test_...) from Dashboard > Developers > Access
// Tokens at duffel.com. No SDK, matches this project's convention of
// calling providers directly via fetch.

const BASE_URL = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

function authHeaders() {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("DUFFEL_ACCESS_TOKEN is not set. Add it to .env.local.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Duffel-Version": DUFFEL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export interface FlightSearchInput {
  origin: string; // IATA airport code, e.g. "LOS"
  destination: string; // IATA code, e.g. "LHR"
  departDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
}

// Kept identical to the shape the UI already expects, so FlightSearchClient
// and the rest of the flights feature didn't need to change when the
// provider underneath did.
export interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  itineraries: {
    duration: string;
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }[];
  }[];
}

export async function searchFlights(input: FlightSearchInput): Promise<FlightOffer[]> {
  const slices: { origin: string; destination: string; departure_date: string }[] = [
    { origin: input.origin.toUpperCase(), destination: input.destination.toUpperCase(), departure_date: input.departDate },
  ];
  if (input.returnDate) {
    slices.push({
      origin: input.destination.toUpperCase(),
      destination: input.origin.toUpperCase(),
      departure_date: input.returnDate,
    });
  }

  const res = await fetch(`${BASE_URL}/air/offer_requests?return_offers=true`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      data: {
        slices,
        passengers: Array.from({ length: input.adults || 1 }, () => ({ type: "adult" })),
        cabin_class: "economy",
      },
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Duffel flight search failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const offers = (json.data?.offers || []) as any[];

  return offers.slice(0, 12).map((o) => ({
    id: o.id as string,
    price: { total: o.total_amount as string, currency: o.total_currency as string },
    itineraries: o.slices.map((s: any) => ({
      duration: s.duration as string,
      segments: s.segments.map((seg: any) => ({
        departure: { iataCode: seg.origin.iata_code as string, at: seg.departing_at as string },
        arrival: { iataCode: seg.destination.iata_code as string, at: seg.arriving_at as string },
        carrierCode: (seg.marketing_carrier?.iata_code as string) || "",
        number: (seg.marketing_carrier_flight_number as string) || "",
      })),
    })),
  }));
}
