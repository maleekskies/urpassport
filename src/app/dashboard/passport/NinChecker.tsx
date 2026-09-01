"use client";

import { useState } from "react";

export function NinChecker() {
  const [ninName, setNinName] = useState("");
  const [appName, setAppName] = useState("");
  const [result, setResult] = useState<null | { match: boolean; message: string }>(null);

  function compare() {
    const a = ninName.trim().toUpperCase();
    const b = appName.trim().toUpperCase();
    if (!a || !b) {
      setResult({ match: false, message: "Enter both names to compare." });
      return;
    }
    if (a === b) {
      setResult({ match: true, message: "Names match exactly. Safe to proceed." });
    } else {
      setResult({
        match: false,
        message: "Names don't match exactly. Fix this before submitting — it's the #1 cause of delays.",
      });
    }
  }

  return (
    <div>
      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3.5 items-end">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Name on NIN record
          </label>
          <input
            value={ninName}
            onChange={(e) => setNinName(e.target.value)}
            placeholder="e.g. CHIDINMA ADAEZE OKAFOR"
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Name on application
          </label>
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g. CHIDINMA ADAEZE OKAFOR"
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
          />
        </div>
        <button
          onClick={compare}
          className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md h-[42px]"
        >
          Compare
        </button>
      </div>
      {result && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm ${
            result.match ? "bg-green-pale text-green-deep" : "bg-red-soft text-red"
          }`}
        >
          {result.match ? "✓" : "⚠"} {result.message}
        </div>
      )}
    </div>
  );
}
