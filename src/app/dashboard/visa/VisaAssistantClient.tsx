"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  COUNTRIES,
  FULL_DATA,
  DB_BACKED_DESTINATIONS,
  GENERIC_ELIGIBILITY,
  GENERIC_DOCUMENTS,
  GENERIC_RISKS,
} from "@/lib/countries";
import { startVisaApplication, toggleVisaChecklistItem, getLiveVisaData } from "./actions";
import type { VisaLookupResult } from "@/lib/visaApi";

interface DbRequirement {
  key: string;
  label: string;
  description: string;
  required: boolean;
}
interface DbApplicationType {
  id: string;
  destination: string | null;
  visa_subtype: string | null;
  display_name: string;
  document_requirements: DbRequirement[];
  common_pitfalls: string[] | null;
}

interface DbApplication {
  id: string;
  application_type_id: string;
  checklist_state: Record<string, boolean>;
  completion_percent: number;
  status: string;
}

const SUBTYPE_LABELS: Record<string, string> = {
  tourist: "Tourist",
  student: "Student",
  work: "Work / Skilled",
  family: "Family",
  transit: "Transit",
};

export function VisaAssistantClient({
  applicationTypes,
  applications,
}: {
  applicationTypes: DbApplicationType[];
  applications: DbApplication[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("United Kingdom");
  const [selectedSubtype, setSelectedSubtype] = useState("tourist");
  const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});
  const [isPending, startTransition] = useTransition();

  // Group by destination code, since a destination can now have multiple
  // visa subtypes (tourist, student, work, ...) each with their own row.
  const typesByDestCode = useMemo(() => {
    const map: Record<string, DbApplicationType[]> = {};
    for (const t of applicationTypes) {
      if (!t.destination) continue;
      (map[t.destination] ||= []).push(t);
    }
    return map;
  }, [applicationTypes]);

  const appByTypeId = useMemo(() => {
    const map: Record<string, DbApplication> = {};
    for (const a of applications) map[a.application_type_id] = a;
    return map;
  }, [applications]);

  const dbCode = DB_BACKED_DESTINATIONS[selected];
  const availableSubtypes = dbCode ? typesByDestCode[dbCode] || [] : [];
  const dbType =
    availableSubtypes.find((t) => t.visa_subtype === selectedSubtype) || availableSubtypes[0];
  const existingApp = dbType ? appByTypeId[dbType.id] : undefined;
  const fullData = FULL_DATA[selected];

  // For every country without a fully researched static guide, pull a real,
  // current visa-requirement status instead of showing generic filler text.
  const [liveData, setLiveData] = useState<VisaLookupResult | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (fullData) {
      setLiveData(null);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    getLiveVisaData(selected).then((result) => {
      if (!cancelled) {
        setLiveData(result);
        setLiveLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selected, fullData]);

  const filtered = COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  function handleStart() {
    if (!dbType) return;
    startTransition(() => {
      startVisaApplication(dbType.id);
    });
  }

  function handleToggle(key: string) {
    if (!existingApp) return;
    startTransition(() => {
      toggleVisaChecklistItem(existingApp.id, key);
    });
  }

  function answer(i: number, val: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [i]: val }));
  }

  const eligibilityQs = fullData ? fullData.eligibility : GENERIC_ELIGIBILITY;
  const risks = fullData ? fullData.risks : GENERIC_RISKS;
  const info = fullData
    ? { fee: fullData.fee, processing: fullData.processing, wait: fullData.wait, centre: fullData.centre }
    : {
        fee: "Check embassy",
        processing: "Check embassy",
        wait: liveData && liveData.available && liveData.durationLabel ? `Stay up to ${liveData.durationLabel}` : "Varies",
        centre: "Nearest embassy or consulate",
      };

  const answered = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter((v) => v === "yes").length;
  const pct = answered ? Math.round((yesCount / eligibilityQs.length) * 100) : null;

  return (
    <div>
      {/* Country picker */}
      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-lg">Choose a destination</h2>
          <span className="text-xs font-mono text-ink-faint">{filtered.length} countries</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="w-full px-4 py-3 border border-line rounded-md text-sm mb-3.5 focus:outline-none focus:ring-2 focus:ring-green-mid"
        />
        <div className="max-h-72 overflow-y-auto border border-line rounded-md bg-white">
          {filtered.map((c) => (
            <div
              key={c}
              onClick={() => {
                setSelected(c);
                setSelectedSubtype("tourist");
                setAnswers({});
              }}
              className={`flex justify-between items-center gap-2 flex-wrap px-4 py-2.5 border-b border-line last:border-0 text-sm font-medium cursor-pointer
              ${c === selected ? "bg-green-deep text-white font-bold" : "text-ink-soft hover:bg-green-pale hover:text-green-deep"}`}
            >
              {c}
              {FULL_DATA[c] && (
                <span
                  className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                    c === selected ? "bg-gold text-navy" : "bg-gold-soft text-[#7a5c1a]"
                  }`}
                >
                  {DB_BACKED_DESTINATIONS[c] ? "★ Live Guide" : "★ Full Guide"}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-faint font-mono mt-2.5">
          ★ Live Guide = real, saveable application. ★ Full Guide = fully researched info,
          not yet backed by a saved application. Other countries show general requirements.
        </p>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-br from-green-deep to-navy text-white rounded-lg p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-5">
        <InfoItem k="Fee" v={info.fee} />
        <InfoItem k="Processing" v={info.processing} />
        <InfoItem k="Realistic Wait" v={info.wait} />
        <InfoItem k="Centre" v={info.centre} />
      </div>

      {availableSubtypes.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {availableSubtypes.map((t) => {
            const key = t.visa_subtype || "tourist";
            const isActive = key === (dbType?.visa_subtype || "tourist");
            return (
              <button
                key={t.id}
                onClick={() => setSelectedSubtype(key)}
                className={`border rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-green-deep border-green-deep text-white"
                    : "border-line text-ink-soft hover:border-green-mid"
                }`}
              >
                {SUBTYPE_LABELS[key] || key}
              </button>
            );
          })}
        </div>
      )}

      {!fullData && (
        <div className="mb-6">
          {liveLoading && (
            <div className="bg-panel border border-line text-ink-soft rounded-md px-4.5 py-3.5 text-sm">
              Checking current visa requirements for Nigerian passport holders travelling to {selected}...
            </div>
          )}
          {!liveLoading && liveData && liveData.available && (
            <div
              className={`rounded-md px-4.5 py-3.5 text-sm flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 ${
                liveData.color === "green"
                  ? "bg-green-pale text-green-deep"
                  : liveData.color === "red"
                  ? "bg-red-soft text-red"
                  : "bg-gold-soft text-[#7a5c1a]"
              }`}
            >
              <span className="font-display font-bold text-base">{liveData.ruleName}</span>
              <span className="text-xs font-mono opacity-80">
                Live data for Nigerian passport holders
                {liveData.source === "cache" ? " (cached)" : ""}, no fully researched step-by-step
                guide yet, so the checklist below is general best-practice, not {selected}-specific.
              </span>
            </div>
          )}
          {!liveLoading && liveData && !liveData.available && (
            <div className="bg-gold-soft text-[#7a5c1a] rounded-md px-4.5 py-3.5 text-sm">
              We couldn&rsquo;t fetch a live requirement for {selected} right now ({liveData.reason}).
              Check {selected}&rsquo;s official embassy or consulate site for exact requirements.
            </div>
          )}
        </div>
      )}

      {dbType && !existingApp && (
        <div className="bg-panel border border-line rounded-lg p-6 mb-6 text-center">
          <p className="text-ink-soft text-sm mb-4">
            Start a real, saved {dbType.display_name} application to track your checklist here.
          </p>
          <button
            onClick={handleStart}
            disabled={isPending}
            className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60"
          >
            {isPending ? "Starting..." : `Start ${dbType.display_name}`}
          </button>
        </div>
      )}

      {/* Eligibility */}
      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Eligibility Check</h2>
        {eligibilityQs.map((q, i) => (
          <div key={i} className="py-4 border-b border-line last:border-0">
            <div className="font-semibold text-sm mb-1">
              {i + 1}. {q[0]}
            </div>
            <div className="text-ink-soft text-sm mb-3">{q[1]}</div>
            <div className="flex gap-2.5">
              <button
                onClick={() => answer(i, "yes")}
                className={`border rounded-md px-5 py-2 text-sm font-semibold ${
                  answers[i] === "yes"
                    ? "bg-green-pale border-green-mid text-green-deep"
                    : "border-line text-ink-soft"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => answer(i, "no")}
                className={`border rounded-md px-5 py-2 text-sm font-semibold ${
                  answers[i] === "no" ? "bg-red-soft border-red text-red" : "border-line text-ink-soft"
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
        {pct !== null && (
          <div
            className={`flex items-center gap-3.5 rounded-md p-4 mt-4 ${
              pct >= 75 ? "bg-green-pale" : pct >= 50 ? "bg-gold-soft" : "bg-red-soft"
            }`}
          >
            <div className="font-mono text-sm font-bold">{pct}%</div>
            <div className="text-sm font-semibold">
              {pct >= 75
                ? "Good shape. Review any No answers before you submit."
                : pct >= 50
                ? "Workable, but strengthen the weak points first."
                : "Significant gaps: address these before applying."}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
        {/* Checklist */}
        <div className="bg-panel border border-line rounded-lg p-6">
          <h2 className="font-display text-lg mb-4">Document Checklist</h2>
          {existingApp && dbType ? (
            <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {dbType.document_requirements.map((doc) => {
                const checked = !!existingApp.checklist_state[doc.key];
                return (
                  <div
                    key={doc.key}
                    onClick={() => handleToggle(doc.key)}
                    className="flex items-start gap-3.5 py-3.5 border-b border-line last:border-0 cursor-pointer"
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-md border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold
                      ${checked ? "bg-green-mid border-green-mid text-white" : "border-line"}`}
                    >
                      {checked ? "✓" : ""}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{doc.label}</div>
                      {doc.description && (
                        <div className="text-ink-soft text-sm mt-0.5">{doc.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <p className="text-xs text-ink-faint font-mono mb-3">
                {dbType ? "Start the application above to save your progress." : "Informational only: not saved."}
              </p>
              {(fullData ? fullData.documents : GENERIC_DOCUMENTS).map((doc, i) => (
                <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-line last:border-0">
                  <div className="w-5.5 h-5.5 rounded-md border-[1.5px] border-line flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">{doc[0]}</div>
                    {doc[1] && <div className="text-ink-soft text-sm mt-0.5">{doc[1]}</div>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Risks */}
        <div className="bg-panel border border-line rounded-lg p-6">
          <h2 className="font-display text-lg mb-4">Rejection Risk Notes</h2>
          {risks.map((r, i) => (
            <div key={i} className="flex gap-2.5 py-3 border-b border-line last:border-0 text-sm text-ink-soft">
              <span className="text-red flex-shrink-0">⚠</span> {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-widest uppercase text-gold-soft mb-1.5">{k}</div>
      <div className="font-display text-lg font-semibold">{v}</div>
    </div>
  );
}
