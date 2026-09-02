// Paystack integration: server-only. Never expose PAYSTACK_SECRET_KEY to
// the client; NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is the only key allowed there
// (unused server-side, kept for a future client-side inline-checkout option).

const PAYSTACK_BASE = "https://api.paystack.co";

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(input: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not set. Add it to .env.local.");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100), // Paystack expects kobo.
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata || {},
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack initialize failed (${res.status})`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface VerifyResult {
  success: boolean;
  status: string;
  amountNaira: number;
  reference: string;
  metadata?: Record<string, unknown>;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not set. Add it to .env.local.");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack verify failed (${res.status})`);
  }

  return {
    success: json.data.status === "success",
    status: json.data.status,
    amountNaira: json.data.amount / 100,
    reference: json.data.reference,
    metadata: json.data.metadata,
  };
}

// Verifies the `x-paystack-signature` header on incoming webhooks:
// HMAC-SHA512 of the raw request body, keyed with the secret key.
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === signature;
}
