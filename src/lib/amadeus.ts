// Amadeus Self-Service API client: OAuth2 client-credentials flow +
// Flight Offers Search. Uses the "test" environment by default (free,
// self-serve keys at developers.amadeus.com); set AMADEUS_ENV=production
// once you have a production contract.
//
// Real API calls, no SDK, matches this project's existing convention of
// calling providers directly via fetch (see planner/actions.ts).

const BASE_URLS = {
  test: "https://test.api.amadeus.com",
  production: "https://api.amadeus.com",
};

function baseUrl() {
  return process.env.AMADEUS_ENV === "production" ? BASE_URLS.production : BASE_URLS.test;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET are not set. Add them to .env.local.");
  }

  const res = await fetch(`${baseUrl()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Amadeus auth failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

export interface FlightSearchInput {
  origin: string; // IATA airport/city code, e.g. "LOS"
  destination: string; // IATA code, e.g. "LHR"
  departDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  currency?: string;
}

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
  const token = await getAccessToken();

  const params = new URLSearchParams({
    originLocationCode: input.origin.toUpperCase(),
    destinationLocationCode: input.destination.toUpperCase(),
    departureDate: input.departDate,
    adults: String(input.adults || 1),
    currencyCode: input.currency || "NGN",
    max: "12",
  });
  if (input.returnDate) params.set("returnDate", input.returnDate);

  const res = await fetch(`${baseUrl()}/v2/shopping/flight-offers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus flight search failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return (json.data || []) as FlightOffer[];
}
