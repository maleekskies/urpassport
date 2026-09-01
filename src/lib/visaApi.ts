// Live visa-requirements lookups via the Travel Buddy Visa Requirements API
// (RapidAPI: visa-requirement.p.rapidapi.com). Free tier, 200 passports x
// 211 destinations, updated daily. Replaces the old "generic guidance"
// fallback — every non-Live-Guide country now gets real, current data
// instead of static filler text, and results are cached in
// `visa_requirements_cache` so repeat lookups don't re-hit the API.
//
// If RAPIDAPI_KEY isn't configured, callers get an explicit
// { available: false } result — never fabricated content standing in for it.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface LiveVisaResult {
  available: true;
  ruleName: string; // e.g. "Visa not required", "eVisa", "Visa required"
  color: "green" | "yellow" | "red" | "gray";
  durationDays: number | null;
  durationLabel: string | null;
  source: "live" | "cache";
  fetchedAt: string;
}
export type VisaLookupResult = LiveVisaResult | { available: false; reason: string };

const CACHE_TTL_HOURS = Number(process.env.VISA_CACHE_TTL_HOURS || 24);

export async function getLiveVisaRequirement(
  supabase: SupabaseClient<Database>,
  passportCode: string,
  destinationCode: string
): Promise<VisaLookupResult> {
  if (!passportCode || !destinationCode) {
    return { available: false, reason: "Unknown country code." };
  }

  // 1. Cache read.
  const { data: cached } = await supabase
    .from("visa_requirements_cache")
    .select("data, expires_at, fetched_at")
    .eq("passport_code", passportCode)
    .eq("destination_code", destinationCode)
    .maybeSingle();

  if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
    return { ...(cached.data as object as LiveVisaResult), source: "cache", fetchedAt: cached.fetched_at };
  }

  // 2. Cache miss / expired — call the live API.
  if (!process.env.RAPIDAPI_KEY) {
    // Serve stale cache rather than nothing, if we have it.
    if (cached) {
      return { ...(cached.data as object as LiveVisaResult), source: "cache", fetchedAt: cached.fetched_at };
    }
    return {
      available: false,
      reason: "Live visa lookups aren't configured yet (RAPIDAPI_KEY missing).",
    };
  }

  const host = process.env.RAPIDAPI_VISA_HOST || "visa-requirement.p.rapidapi.com";

  try {
    const res = await fetch(`https://${host}/v2/visa/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": host,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
      body: JSON.stringify({ passport: passportCode, destination: destinationCode }),
      // Keep a signal timeout so a slow upstream never hangs a page render.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (cached) return { ...(cached.data as object as LiveVisaResult), source: "cache", fetchedAt: cached.fetched_at };
      return { available: false, reason: `Visa API error (${res.status}).` };
    }

    const json = await res.json();
    const rule = json?.data?.current_rule;
    if (!rule) {
      if (cached) return { ...(cached.data as object as LiveVisaResult), source: "cache", fetchedAt: cached.fetched_at };
      return { available: false, reason: "Visa API returned no rule for this pair." };
    }

    const result: LiveVisaResult = {
      available: true,
      ruleName: rule.display_label || rule.name || "Unknown",
      color: (rule.color as LiveVisaResult["color"]) || "gray",
      durationDays: rule.duration_days ?? null,
      durationLabel: rule.duration ?? null,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };

    // 3. Write through to cache (best-effort — don't fail the request if this fails).
    await supabase.from("visa_requirements_cache").upsert(
      {
        passport_code: passportCode,
        destination_code: destinationCode,
        data: result,
        fetched_at: result.fetchedAt,
        expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "passport_code,destination_code" }
    );

    return result;
  } catch (err) {
    if (cached) return { ...(cached.data as object as LiveVisaResult), source: "cache", fetchedAt: cached.fetched_at };
    return { available: false, reason: err instanceof Error ? err.message : "Visa API request failed." };
  }
}
