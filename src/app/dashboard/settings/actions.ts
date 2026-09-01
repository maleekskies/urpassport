"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { BILLABLE_ITEMS } from "@/lib/billing";

export async function initializePayment(purposeKey: string) {
  const user = await requireUser();
  const supabase = createClient();
  const item = BILLABLE_ITEMS[purposeKey];
  if (!item) throw new Error("Unknown billing item.");

  const reference = `urp_${user.id.slice(0, 8)}_${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id,
    amount: item.amountNaira,
    currency: "NGN",
    purpose: item.label,
    paystack_reference: reference,
    status: "pending",
  });
  if (insertError) throw insertError;

  const result = await initializeTransaction({
    email: user.email || "",
    amountNaira: item.amountNaira,
    reference,
    callbackUrl: `${appUrl}/dashboard/settings/billing/callback`,
    metadata: { purposeKey, userId: user.id },
  });

  return result.authorizationUrl;
}

// Used by the callback page as a client-facing fallback verification path
// (the webhook is the source of truth, but Paystack can redirect the user
// back before the webhook has landed).
export async function verifyPayment(reference: string) {
  const user = await requireUser();
  const supabase = createClient();

  const result = await verifyTransaction(reference);

  const { data: existing } = await supabase
    .from("payments")
    .select("id, user_id, status")
    .eq("paystack_reference", reference)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error("Payment record not found.");
  }

  if (existing.status !== "success") {
    await supabase
      .from("payments")
      .update({ status: result.success ? "success" : "failed" })
      .eq("id", existing.id);
  }

  revalidatePath("/dashboard/settings");
  return result;
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
}

// Updates the editable fields on the user's profile row.
// full_name and phone are plain text; NIN is hashed before storage — we never
// persist the raw NIN, matching the "nothing sent anywhere" spirit of the
// NIN Match Checker on the Passport Hub.
export async function updateProfile(formData: FormData): Promise<ProfileUpdateResult> {
  const user = await requireUser();
  const supabase = createClient();

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const nin = String(formData.get("nin") || "").trim();

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }
  if (phone && !/^\+?[0-9\s-]{7,15}$/.test(phone)) {
    return { success: false, error: "Enter a valid phone number." };
  }
  if (nin && !/^\d{11}$/.test(nin)) {
    return { success: false, error: "NIN must be exactly 11 digits." };
  }

  const update: Database["public"]["Tables"]["users"]["Update"] = {
    full_name: fullName,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  };

  // Only touch nin_hash if the user actually typed a NIN this time —
  // an empty field means "leave whatever's on file alone", not "clear it".
  if (nin) {
    update.nin_hash = await hashNin(nin);
  }

  const { error } = await supabase.from("users").update(update).eq("id", user.id);

  if (error) {
    return { success: false, error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setEmailReminders(enabled: boolean) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("users").update({ notify_email: enabled }).eq("id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}

// SHA-256 hash so we can support "does this NIN match?" checks later without
// ever storing the NIN itself in plain text.
async function hashNin(nin: string): Promise<string> {
  const data = new TextEncoder().encode(nin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
