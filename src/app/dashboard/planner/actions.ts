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
  const supabase = await createClient();

  if (!process.env.GROQ_API_KEY) {
    return { error: "AI Trip Planner isn't configured yet (GROQ_API_KEY missing)." };
  }

  const dailyLimit = Number(process.env.AI_PLANNER_DAILY_LIMIT || 5);

  if (new Date(input.endDate).getTime() <= new Date(input.startDate).getTime()) {
    return { error: "End date must be after start date." };
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
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        max_completion_tokens: 4096,
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
      // Response wasn't JSON, keep the generic status-based message.
    }
    return { error: message };
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    return { error: "The AI response couldn't be read. Try again." };
  }
  const rawText: string = data.choices?.[0]?.message?.content || "";

  let planJson: unknown;
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    planJson = JSON.parse(cleaned);
  } catch {
    return { error: "The AI response wasn't valid JSON. Try again." };
  }

  const { data: allowed, error: limitError } = await supabase.rpc("try_reserve_ai_plan", {
    p_user: user.id,
    p_limit: dailyLimit,
  });

  if (limitError) return { error: limitError.message };
  if (!allowed) {
    return { error: `You've reached today's limit of ${dailyLimit} AI itineraries. Try again in 24 hours.` };
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
      ai_model_version: "openai/gpt-oss-20b",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/planner");
  return { itineraryId: itinerary.id };
}
