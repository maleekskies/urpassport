"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

interface GenerateInput {
  destination: string;
  startDate: string;
  endDate: string;
  budgetNgn: number;
  purpose: string;
}

export interface GenerateResult {
  itineraryId?: string;
  error?: string;
}

// Returns a result object instead of throwing. Errors thrown from a Server
// Action get their message redacted by Next.js in production (a security
// measure, not a bug) and replaced with a generic "Server Components
// render" message, so any error the person should actually see has to
// travel back as normal data, not as a thrown exception.
export async function generateItinerary(input: GenerateInput): Promise<GenerateResult> {
  const user = await requireUser();
  const supabase = createClient();

  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "AI Trip Planner isn't configured yet (ANTHROPIC_API_KEY missing)." };
  }

  // Rate limit: prevents one user from running up the Anthropic bill.
  const dailyLimit = Number(process.env.AI_PLANNER_DAILY_LIMIT || 5);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("feature", "trip_planner")
    .gte("created_at", since);

  if ((count || 0) >= dailyLimit) {
    return { error: `You've reached today's limit of ${dailyLimit} AI itineraries. Try again in 24 hours.` };
  }

  const days =
    Math.max(
      1,
      Math.round(
        (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    ) + 1;

  const prompt = `You are a travel planner for a Nigerian traveler. Build a ${days}-day itinerary for a trip to ${input.destination}, starting ${input.startDate} and ending ${input.endDate}. Total budget: ₦${input.budgetNgn.toLocaleString()}. Purpose: ${input.purpose}.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{
  "days": [
    { "date": "YYYY-MM-DD", "items": [ { "time": "9:00 AM", "title": "...", "description": "...", "cost_ngn": 0 } ] }
  ],
  "estimated_total_ngn": 0,
  "packing_reminders": ["..."]
}

Keep costs realistic in Naira. Include 3-5 items per day. Packing reminders should include any document reminders relevant to a Nigerian traveler visiting ${input.destination}.`;

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    return { error: err instanceof Error ? `Couldn't reach the AI planner: ${err.message}` : "Couldn't reach the AI planner." };
  }

  if (!response.ok) {
    let message = `AI planner request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // Response wasn't JSON — keep the generic status-based message.
    }
    return { error: message };
  }

  const data = await response.json();
  const rawText: string = data.content
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("\n");

  let planJson: unknown;
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    planJson = JSON.parse(cleaned);
  } catch {
    return { error: "The AI response wasn't valid JSON. Try again." };
  }

  const { data: itinerary, error } = await supabase
    .from("itineraries")
    .insert({
      user_id: user.id,
      destination: input.destination,
      start_date: input.startDate,
      end_date: input.endDate,
      budget_ngn: input.budgetNgn,
      purpose: input.purpose,
      plan_json: planJson,
      ai_model_version: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("ai_usage_log").insert({ user_id: user.id, feature: "trip_planner" });

  revalidatePath("/dashboard/planner");
  return { itineraryId: itinerary.id };
}
