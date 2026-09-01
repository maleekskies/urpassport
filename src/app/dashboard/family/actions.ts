"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

async function hashNin(nin: string): Promise<string> {
  const data = new TextEncoder().encode(nin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function addFamilyMember(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();

  const fullName = String(formData.get("full_name") || "").trim();
  const relationship = String(formData.get("relationship") || "").trim();
  const dob = String(formData.get("date_of_birth") || "").trim();
  const nin = String(formData.get("nin") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName) throw new Error("Name is required.");
  if (nin && !/^\d{11}$/.test(nin)) throw new Error("NIN must be exactly 11 digits.");

  const { error } = await supabase.from("family_members").insert({
    owner_user_id: user.id,
    full_name: fullName,
    relationship: relationship || null,
    date_of_birth: dob || null,
    nin_hash: nin ? await hashNin(nin) : null,
    notes: notes || null,
  });

  if (error) throw error;
  revalidatePath("/dashboard/family");
}

export async function removeFamilyMember(id: string) {
  const user = await requireUser();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("family_members")
    .select("owner_user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_user_id !== user.id) {
    throw new Error("Family member not found.");
  }

  const { error } = await supabase.from("family_members").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/family");
}
