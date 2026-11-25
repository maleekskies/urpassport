import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

// Paystack webhook, registered at /api/paystack/webhook on the deployed host.
// It is the source of truth for payment status; the callback page is a fallback.
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
