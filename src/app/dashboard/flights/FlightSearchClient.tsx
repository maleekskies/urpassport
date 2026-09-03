"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { runFlightSearch, holdFlightOffer, lookupAirports } from "./actions";
import type { FlightOffer, PlaceSuggestion } from "@/lib/duffel";

interface VisaApp {
  destination: string;
  displayName: string;
  completionPercent: number;
  status: string;
}
interface Booking {
  id: string;
  origin: string | null;
  destination: string | null;
  depart_date: string | null;
  return_date: string | null;
  price_ngn: number | null;
  status: string;
  created_at: string;
}

// Airports for the 4 "Live Guide" visa destinations, enough to power the
// visa-linked banner without needing a full IATA-to-country database.
const AIRPORT_TO_DEST: Record<string, string> = {
  LHR: "UK", LGW: "UK", MAN: "UK", STN: "UK", LTN: "UK",
  JFK: "US", LAX: "US", ORD: "US", ATL: "US", IAD: "US", EWR: "US",
  YYZ: "Canada", YVR: "Canada", YUL: "Canada",
  DXB: "UAE", AUH: "UAE", SHJ: "UAE",
};

// Type a city or airport name, pick a suggestion, get the IATA code behind
// it. Falls back to accepting a raw 3-letter code typed directly, so
// nothing breaks for anyone who already knows the code they want.
function AirportField({
  label,
  code,
  onChange,
}: {
  label: string;
  code: string;
  onChange: (code: string) => void;
}) {
  const [query, setQuery] = useState(code);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(code);
  }, [code]);

  function handleInput(value: string) {
    setQuery(value);
    onChange(value.toUpperCase());
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await lookupAirports(value);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
  }

  function handleSelect(place: PlaceSuggestion) {
    onChange(place.iataCode);
    setQuery(`${place.cityName || place.name} (${place.iataCode})`);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-ink-soft mb-1.5">{label}</label>
      <input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="City or airport"
        className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-panel border border-line rounded-md shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-green-pale border-b border-line last:border-0"
            >
              <span className="font-semibold">{s.cityName || s.name}</span>{" "}
              <span className="text-ink-faint font-mono text-xs">{s.iataCode}</span>
              {s.type === "airport" && s.name !== s.cityName && (
                <div className="text-ink-faint text-xs">{s.name}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FlightSearchClient({
  visaApplications,
  recentBookings,
}: {
  visaApplications: VisaApp[];
  recentBookings: Booking[];
}) {
  const [origin, setOrigin] = useState("LOS");
  const [destination, setDestination] = useState("LHR");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults] = useState(1);
  const [offers, setOffers] = useState<FlightOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [heldIds, setHeldIds] = useState<Set<string>>(new Set());

  const linkedVisaDest = AIRPORT_TO_DEST[destination.toUpperCase()];
  const linkedVisaApp = visaApplications.find((v) => v.destination === linkedVisaDest);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOffers(null);
    startTransition(async () => {
      const result = await runFlightSearch({
        origin,
        destination,
        departDate,
        returnDate: returnDate || undefined,
        adults,
      });
      if (result.error) setError(result.error);
      else setOffers(result.offers || []);
    });
  }

  function handleHold(offer: FlightOffer) {
    startTransition(async () => {
      await holdFlightOffer({
        origin,
        destination,
        departDate,
        returnDate: returnDate || undefined,
        priceNgn: Number(offer.price.total),
        offerId: offer.id,
      });
      setHeldIds((prev) => new Set(prev).add(offer.id));
    });
  }

  return (
    <div>
      {linkedVisaDest && (
        <div
          className={`rounded-md px-4.5 py-3.5 text-sm mb-6 ${
            linkedVisaApp
              ? linkedVisaApp.completionPercent >= 100
                ? "bg-green-pale text-green-deep"
                : "bg-gold-soft text-[#7a5c1a]"
              : "bg-red-soft text-red"
          }`}
        >
          {linkedVisaApp ? (
            <>
              <strong>{linkedVisaApp.displayName}</strong> is {linkedVisaApp.completionPercent}% complete
              ({linkedVisaApp.status.replace("_", " ")}).{" "}
              {linkedVisaApp.completionPercent >= 100
                ? "You're set on documents: safe to look at dates."
                : "Finish your checklist before booking anything non-refundable."}
            </>
          ) : (
            <>
              You don&rsquo;t have a visa application in progress for this destination yet. Start one on
              the Visa Assistant before booking non-refundable flights.
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-panel border border-line rounded-lg p-6 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <AirportField label="From" code={origin} onChange={setOrigin} />
        <AirportField label="To" code={destination} onChange={setDestination} />
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Depart</label>
          <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} required
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Return (optional)</label>
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
        </div>
        <button type="submit" disabled={isPending}
          className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60">
          {isPending ? "Searching..." : "Search flights"}
        </button>
      </form>

      {error && <div className="bg-red-soft text-red rounded-md px-4 py-3 text-sm mb-6">⚠ {error}</div>}

      {offers && offers.length === 0 && !error && (
        <div className="text-ink-soft text-sm mb-6">No fares found for those dates. Try adjusting them.</div>
      )}

      {offers && offers.length > 0 && (
        <div className="bg-panel border border-line rounded-lg divide-y divide-line mb-6">
          {offers.map((offer) => {
            const seg = offer.itineraries[0]?.segments[0];
            const lastSeg = offer.itineraries[0]?.segments.at(-1);
            const held = heldIds.has(offer.id);
            return (
              <div key={offer.id} className="flex items-center justify-between p-5 flex-wrap gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm">
                    {seg?.departure.iataCode} → {lastSeg?.arrival.iataCode}
                  </div>
                  <div className="text-ink-soft text-xs mt-1">
                    {seg?.carrierCode}{seg?.number} · {offer.itineraries[0]?.duration.replace("PT", "").toLowerCase()}
                    {offer.itineraries.length > 1 ? " · round trip" : " · one way"}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="font-display text-lg font-bold whitespace-nowrap">
                    {offer.price.currency} {Number(offer.price.total).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleHold(offer)}
                    disabled={held || isPending}
                    className="border border-green-deep text-green-deep hover:bg-green-pale transition-colors font-semibold text-xs px-4 py-2 rounded-md disabled:opacity-60 whitespace-nowrap"
                  >
                    {held ? "Held ✓" : "Hold this fare"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recentBookings.length > 0 && (
        <div className="bg-panel border border-line rounded-lg p-6">
          <h2 className="font-display text-lg mb-4">Recently held</h2>
          {recentBookings.map((b) => (
            <div key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2 py-2.5 border-b border-line last:border-0 text-sm">
              <span className="min-w-0">{b.origin} → {b.destination} · {b.depart_date}</span>
              <span className="font-mono text-ink-soft text-xs sm:text-sm flex-shrink-0">{b.price_ngn ? `₦${Number(b.price_ngn).toLocaleString()}` : ""} · {b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
