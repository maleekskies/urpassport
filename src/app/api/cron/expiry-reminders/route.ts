import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/resend";

// Scheduled route: point a daily cron (Vercel Cron, Supabase Cron, GitHub
// Actions, etc.) at this URL with `Authorization: Bearer <CRON_SECRET>`.
// Vercel Cron example (vercel.json):
//   { "crons": [{ "path": "/api/cron/expiry-reminders", "schedule": "0 7 * * *" }] }
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
    .lte("expiry_date", in30Days);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const doc of documents || []) {
    const owner = (doc as any).users as { email: string; full_name: string; notify_email: boolean } | null;
    if (!owner || !owner.notify_email || !owner.email) {
      skipped++;
      continue;
    }

    const daysLeft = Math.ceil(
      (new Date(doc.expiry_date as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const subject =
      daysLeft < 0
        ? `${doc.file_name} has expired`
        : `${doc.file_name} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

    try {
      await sendEmail({
        to: owner.email,
        subject,
        html: `<p>Hi ${owner.full_name || "there"},</p>
<p><strong>${doc.file_name}</strong> ${daysLeft < 0 ? "expired on" : "expires on"} ${doc.expiry_date}.
Log in to UrPassport NG and renew or replace it in your Document Vault.</p>`,
      });

      await supabase.from("documents").update({ reminder_sent_at: new Date().toISOString() }).eq("id", doc.id);
      await supabase.from("notification_log").insert({
        user_id: doc.user_id,
        channel: "email",
        subject,
        related_type: "document",
        related_id: doc.id,
      });
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ checked: documents?.length || 0, sent, skipped });
}
