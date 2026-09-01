"use client";

import { useState, useTransition } from "react";
import { initializePayment, setEmailReminders, BILLABLE_ITEMS } from "./actions";

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  created_at: string;
}

export function BillingPanel({
  payments,
  notifyEmail,
}: {
  payments: PaymentRow[];
  notifyEmail: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState(notifyEmail);

  function handlePay(key: string) {
    setError(null);
    startTransition(async () => {
      try {
        const url = await initializePayment(key);
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      }
    });
  }

  function handleToggleNotify() {
    const next = !notify;
    setNotify(next);
    startTransition(() => {
      setEmailReminders(next);
    });
  }

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Billing</h2>
        {error && <div className="bg-red-soft text-red rounded-md px-4 py-3 text-sm mb-4">⚠ {error}</div>}
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {Object.entries(BILLABLE_ITEMS).map(([key, item]) => (
            <div key={key} className="border border-line rounded-md p-4 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-sm mb-1">{item.label}</div>
                <div className="font-display text-lg font-bold">₦{item.amountNaira.toLocaleString()}</div>
              </div>
              <button
                onClick={() => handlePay(key)}
                disabled={isPending}
                className="mt-4 bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-xs px-4 py-2 rounded-md disabled:opacity-60"
              >
                Pay with Paystack
              </button>
            </div>
          ))}
        </div>

        {payments.length > 0 && (
          <div className="border-t border-line pt-4">
            <div className="text-xs font-semibold text-ink-soft mb-2">Payment history</div>
            {payments.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2 py-2 text-sm border-b border-line last:border-0">
                <span className="min-w-0">{p.purpose}</span>
                <span className="font-mono text-ink-soft text-xs sm:text-sm flex-shrink-0">
                  ₦{Number(p.amount).toLocaleString()} · {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-panel border border-line rounded-lg p-6">
        <h2 className="font-display text-lg mb-2">Notifications</h2>
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={notify} onChange={handleToggleNotify} className="w-4 h-4" />
          Email me when a document or visa is about to expire
        </label>
      </div>
    </div>
  );
}
