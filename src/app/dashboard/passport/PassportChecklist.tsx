"use client";

import { useTransition } from "react";
import { toggleChecklistItem } from "./actions";

interface Requirement {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export function PassportChecklist({
  applicationId,
  requirements,
  checklistState,
}: {
  applicationId: string;
  requirements: Requirement[];
  checklistState: Record<string, boolean>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: string) {
    startTransition(() => {
      toggleChecklistItem(applicationId, key);
    });
  }

  const checkedCount = requirements.filter((r) => checklistState[r.key]).length;

  return (
    <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
      <div className="text-xs font-mono text-ink-faint mb-3">
        {checkedCount} of {requirements.length} complete
      </div>
      {requirements.map((req) => {
        const checked = !!checklistState[req.key];
        return (
          <div
            key={req.key}
            onClick={() => handleToggle(req.key)}
            className="flex items-start gap-3.5 py-3.5 border-b border-line last:border-0 cursor-pointer"
          >
            <div
              className={`w-5.5 h-5.5 rounded-md border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold
              ${checked ? "bg-green-mid border-green-mid text-white" : "border-line"}`}
            >
              {checked ? "✓" : ""}
            </div>
            <div>
              <div className="font-semibold text-sm">{req.label}</div>
              {req.description && (
                <div className="text-ink-soft text-sm mt-0.5">{req.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
