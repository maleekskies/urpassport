"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateItinerary } from "./actions";

export function PlannerForm({ remaining, dailyLimit }: { remaining: number; dailyLimit: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [destination, setDestination] = useState("London, United Kingdom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("1800000");
  const [purpose, setPurpose] = useState("Holiday");

  const limitReached = remaining <= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (limitReached) {
      setError(`You've used all ${dailyLimit} AI itineraries for today. Try again in 24 hours.`);
      return;
    }

    if (!startDate || !endDate) {
      setError("Pick both a start and end date.");
      return;
    }

    startTransition(async () => {
      const result = await generateItinerary({
        destination,
        startDate,
        endDate,
        budgetNgn: Number(budget) || 0,
        purpose,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-green-deep to-navy text-white rounded-lg p-7 mb-6"
    >
      <div className="font-mono text-[10.5px] tracking-widest uppercase text-gold-soft mb-2.5 flex justify-between items-center">
        <span>Plan a new trip</span>
        <span>{remaining}/{dailyLimit} left today</span>
      </div>
      <h2 className="font-display text-xl mb-4">Where are you headed?</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1.5 font-mono">
            Destination
          </label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/25 rounded-md text-sm placeholder-white/40"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1.5 font-mono">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/25 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1.5 font-mono">
            End date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/25 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1.5 font-mono">
            Budget (NGN)
          </label>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/25 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {["Holiday", "Study", "Work", "Family visit"].map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPurpose(p)}
            className={`px-4 py-2 rounded-full text-sm border ${
              purpose === p
                ? "bg-gold border-gold text-navy font-bold"
                : "border-white/25 bg-white/5 text-white/85"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {error && <p className="text-sm bg-red-soft text-red rounded-md px-4 py-2.5 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isPending || limitReached}
        className="bg-gold text-navy font-bold text-sm px-6.5 py-3.5 rounded-md disabled:opacity-60"
      >
        {isPending ? "Generating with AI..." : limitReached ? "Daily limit reached" : "✦ Generate Itinerary"}
      </button>
    </form>
  );
}
