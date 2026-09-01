"use client";

import { useTransition } from "react";
import { addFamilyMember, removeFamilyMember } from "./actions";

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string | null;
  date_of_birth: string | null;
  notes: string | null;
}

export function FamilyMembersClient({ members }: { members: FamilyMember[] }) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addFamilyMember(formData);
    });
  }

  function handleRemove(id: string) {
    if (!confirm("Remove this family member? This won't delete any applications already linked to them.")) return;
    startTransition(() => {
      removeFamilyMember(id);
    });
  }

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Add a family member</h2>
        <form action={handleAdd} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">Full name</label>
            <input name="full_name" required className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">Relationship</label>
            <input name="relationship" placeholder="Spouse, child, parent..." className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">Date of birth</label>
            <input name="date_of_birth" type="date" className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">NIN (optional)</label>
            <input name="nin" inputMode="numeric" maxLength={11} placeholder="11-digit NIN" className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
            <p className="text-[11px] text-ink-faint mt-1">Stored as a one-way hash, same as your own profile.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-ink-soft mb-1.5">Notes</label>
            <input name="notes" className="w-full px-3 py-2.5 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={isPending} className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60">
              {isPending ? "Saving..." : "Add family member"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-panel border border-line rounded-lg p-6">
        <h2 className="font-display text-lg mb-4">Your family</h2>
        {members.length === 0 && (
          <p className="text-ink-soft text-sm text-center py-6">
            No family members added yet. Add one above to start managing their passport/visa applications.
          </p>
        )}
        {members.map((m) => (
          <div key={m.id} className="flex justify-between items-start py-3.5 border-b border-line last:border-0">
            <div>
              <div className="font-semibold text-sm">{m.full_name}</div>
              <div className="text-ink-soft text-xs mt-0.5">
                {[m.relationship, m.date_of_birth].filter(Boolean).join(" · ")}
              </div>
              {m.notes && <div className="text-ink-faint text-xs mt-0.5">{m.notes}</div>}
            </div>
            <button onClick={() => handleRemove(m.id)} disabled={isPending} className="text-red text-xs font-semibold">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
