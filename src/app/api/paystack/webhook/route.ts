import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

// Paystack webhook: configure this URL (https://yourdomain.com/api/paystack/webhook)
// in the Paystack dashboard under Settings > API Keys & Webhooks. This is the
// source of truth for payment status; the /billing/callback page is just a
// friendlier fallback for the redirect-back UX.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createServiceClient();

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    await supabase
      .from("payments")
      .update({ status: "success" })
      .eq("paystack_reference", reference);
  } else if (event.event === "charge.failed") {
    const reference = event.data.reference;
    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("paystack_reference", reference);
  }

  return NextResponse.json({ received: true });
}
