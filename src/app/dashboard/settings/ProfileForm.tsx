"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";

interface Props {
  email: string;
  fullName: string;
  phone: string | null;
  hasNinOnFile: boolean;
}

export function ProfileForm({ email, fullName, phone, hasNinOnFile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setFeedback({ type: "success", message: "Profile updated." });
      } else {
        setFeedback({ type: "error", message: result.error || "Couldn't update your profile." });
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Email</label>
          <input
            value={email}
            disabled
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm bg-panel text-ink-faint cursor-not-allowed"
          />
          <p className="text-[11px] text-ink-faint mt-1">Email can't be changed here.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5" htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={fullName}
            required
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone || ""}
            placeholder="+234 800 000 0000"
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5" htmlFor="nin">
            NIN
          </label>
          <input
            id="nin"
            name="nin"
            inputMode="numeric"
            maxLength={11}
            placeholder={hasNinOnFile ? "•••••••••••  (on file, enter to replace)" : "11-digit NIN"}
            className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
          />
          <p className="text-[11px] text-ink-faint mt-1">
            Stored as a one-way hash, never in plain text. Leave blank to keep what's on file.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-md px-4 py-3 text-sm mb-4 ${
            feedback.type === "success" ? "bg-green-pale text-green-deep" : "bg-red-soft text-red"
          }`}
        >
          {feedback.type === "success" ? "✓" : "⚠"} {feedback.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
