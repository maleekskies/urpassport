"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

// Creates the user's passport application row if one doesn't already exist.
// Idempotent: if called again, it just returns the existing application.
export async function startPassportApplication() {
  const user = await requireUser();
  const supabase = createClient();

  const typeId = await getPassportTypeId();

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("application_type_id", typeId)
    .maybeSingle();

  if (existing) {
    revalidatePath("/dashboard/passport");
    return existing.id;
  }
  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      application_type_id: typeId,
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

  revalidatePath("/dashboard/passport");
  revalidatePath("/dashboard");
  return data.id;
}

// Toggles one checklist item and recomputes completion_percent from how many
// required documents are checked — this is the number the Dashboard's
// progress bar actually reads.
export async function toggleChecklistItem(applicationId: string, key: string) {
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

  revalidatePath("/dashboard/passport");
  revalidatePath("/dashboard");
}

async function getPassportTypeId() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("application_types")
    .select("id")
    .eq("category", "passport")
    .limit(1)
    .single();
  if (error || !data) {
    throw new Error(
      "No passport application_type found — did you run supabase/seed.sql?"
    );
  }
  return data.id;
}
