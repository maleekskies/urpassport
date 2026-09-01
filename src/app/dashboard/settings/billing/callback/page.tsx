import Link from "next/link";
import { verifyPayment } from "../../actions";

export default async function BillingCallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string };
}) {
  const reference = searchParams.reference || searchParams.trxref;

  if (!reference) {
    return (
      <div className="bg-panel border border-line rounded-lg p-8 text-center">
        <p className="text-ink-soft text-sm mb-4">No payment reference found.</p>
        <Link href="/dashboard/settings" className="text-green-deep font-semibold text-sm">
          Back to Settings
        </Link>
      </div>
    );
  }

  let result;
  let error: string | null = null;
  try {
    result = await verifyPayment(reference);
  } catch (err) {
    error = err instanceof Error ? err.message : "Couldn't verify payment.";
  }

  return (
    <div className="bg-panel border border-line rounded-lg p-8 text-center max-w-md mx-auto">
      {error && (
        <>
          <div className="text-3xl mb-3">⚠</div>
          <p className="font-semibold mb-1">Couldn&rsquo;t verify payment</p>
          <p className="text-ink-soft text-sm mb-5">{error}</p>
        </>
      )}
      {result && (
        <>
          <div className="text-3xl mb-3">{result.success ? "✓" : "⚠"}</div>
          <p className="font-semibold mb-1">
            {result.success ? "Payment successful" : `Payment ${result.status}`}
          </p>
          <p className="text-ink-soft text-sm mb-5">
            ₦{result.amountNaira.toLocaleString()} · ref {result.reference}
          </p>
        </>
      )}
      <Link
        href="/dashboard/settings"
        className="inline-block bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md"
      >
        Back to Settings
      </Link>
    </div>
  );
}
