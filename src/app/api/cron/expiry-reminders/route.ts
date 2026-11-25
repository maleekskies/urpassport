import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/resend";

// Scheduled route. The caller sends the shared secret as a bearer token.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, file_name, expiry_date, user_id, users(email, full_name, notify_email)")
    .is("reminder_sent_at", null)
    .not("expiry_date", "is", null)
    .lte("expiry_date", in30Days)
    .order("expiry_date", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of documents || []) {
    const owner = (doc as any).users as { email: string; full_name: string; notify_email: boolean } | null;
    if (!owner || !owner.notify_email || !owner.email) {
      skipped++;
      continue;
    }

    const daysLeft = Math.ceil(
      (new Date(doc.expiry_date as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const expiryText =
      daysLeft < 0
        ? "has expired"
        : daysLeft === 0
        ? "expires today"
        : `expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    const subject = `${doc.file_name} ${expiryText}`;
    const safeName = doc.file_name.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    const safeOwner = (owner.full_name || "there").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

    try {
      await sendEmail({
        to: owner.email,
        subject,
        html: `<p>Hi ${safeOwner},</p>
<p><strong>${safeName}</strong> ${daysLeft < 0 ? "expired on" : "expires on"} ${doc.expiry_date}.
Log in to UrPassport NG and renew or replace it in your Document Vault.</p>`,
      });

      const { error: updateError } = await supabase
        .from("documents")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", doc.id)
        .eq("user_id", doc.user_id);

      if (updateError) {
        failed++;
        continue;
      }

      const { error: logError } = await supabase.from("notification_log").insert({
        user_id: doc.user_id,
        channel: "email",
        subject,
        related_type: "document",
        related_id: doc.id,
      });

      if (logError) failed++;
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ checked: documents?.length || 0, sent, skipped, failed });
}
