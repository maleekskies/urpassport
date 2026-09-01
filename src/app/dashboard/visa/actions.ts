"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getLiveVisaRequirement, type VisaLookupResult } from "@/lib/visaApi";
import { COUNTRY_CODES, NIGERIA_CODE } from "@/lib/countries";

// Real-time visa requirement lookup for any of the 193 countries that don't
// have a fully researched static guide. Replaces the old static "generic
// guidance" fallback — this is live data (cached up to VISA_CACHE_TTL_HOURS),
// not fabricated content.
export async function getLiveVisaData(countryName: string): Promise<VisaLookupResult> {
  await requireUser();
  const supabase = createClient();
  const destCode = COUNTRY_CODES[countryName];
  if (!destCode) {
    return { available: false, reason: "Unrecognized country." };
  }
  return getLiveVisaRequirement(supabase, NIGERIA_CODE, destCode);
}

export async function startVisaApplication(applicationTypeId: string) {
  const user = await requireUser();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("application_type_id", applicationTypeId)
    .maybeSingle();

  if (existing) {
    revalidatePath("/dashboard/visa");
    return existing.id;
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      application_type_id: applicationTypeId,
      status: "in_progress",
      current_step: 1,
      completion_percent: 0,
      checklist_state: {},
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("application_events").insert({
    application_id: data.id,
    event_type: "created",
    event_label: "Application started",
  });

  revalidatePath("/dashboard/visa");
  revalidatePath("/dashboard");
  return data.id;
}

export async function toggleVisaChecklistItem(applicationId: string, key: string) {
  const user = await requireUser();
  const supabase = createClient();

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("checklist_state, application_type_id, user_id")
    .eq("id", applicationId)
    .single();

  if (fetchError || !app || app.user_id !== user.id) {
    throw new Error("Application not found");
  }

  const { data: type } = await supabase
    .from("application_types")
    .select("document_requirements")
    .eq("id", app.application_type_id)
    .single();

  const requirements = (type?.document_requirements || []) as { key: string; required: boolean }[];
  const newChecklist = { ...(app.checklist_state as Record<string, boolean>) };
  newChecklist[key] = !newChecklist[key];

  const requiredKeys = requirements.filter((r) => r.required).map((r) => r.key);
  const checkedRequired = requiredKeys.filter((k) => newChecklist[k]).length;
  const completion = requiredKeys.length
    ? Math.round((checkedRequired / requiredKeys.length) * 100)
    : 0;

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      checklist_state: newChecklist,
      completion_percent: completion,
      status: completion === 100 ? "on_track" : "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) throw updateError;

  revalidatePath("/dashboard/visa");
  revalidatePath("/dashboard");
}
