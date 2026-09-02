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

export async function generateItinerary(input: GenerateInput) {
  const user = await requireUser();
  const supabase = createClient();

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
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
    throw new Error(
      `You've reached today's limit of ${dailyLimit} AI itineraries. Try again in 24 hours.`
    );
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
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
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${text}`);
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
    throw new Error("The AI response wasn't valid JSON. Try again.");
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

  if (error) throw error;

  await supabase.from("ai_usage_log").insert({ user_id: user.id, feature: "trip_planner" });

  revalidatePath("/dashboard/planner");
  return itinerary.id;
}
