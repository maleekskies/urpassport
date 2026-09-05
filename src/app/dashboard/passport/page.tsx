import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { startPassportApplication } from "./actions";
import { PassportChecklist } from "./PassportChecklist";
import { StartApplicationButton } from "@/components/StartApplicationButton";
import { NinChecker } from "./NinChecker";

export const metadata: Metadata = {
  title: "Passport Hub",
  description: "Track your Nigerian passport renewal and check your NIN against your bio-data.",
};

export default async function PassportPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: passportType } = await supabase
    .from("application_types")
    .select("*")
    .eq("category", "passport")
    .maybeSingle();

  if (!passportType) {
    return (
      <div className="bg-red-soft text-red rounded-md p-5 text-sm">
        No passport application type found in the database. Run{" "}
        <code className="font-mono">supabase/seed.sql</code> in your Supabase SQL editor first.
      </div>
    );
  }

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .eq("application_type_id", passportType.id)
    .maybeSingle();

  const requirements = (passportType.document_requirements || []) as {
    key: string;
    label: string;
    description: string;
    required: boolean;
  }[];

  const steps = (passportType.process_steps || []) as {
    step_number: number;
    title: string;
    description: string;
  }[];

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Passport Hub</div>
      <h1 className="font-display text-2xl mb-6">Nigerian Passport</h1>

      <div className="bg-panel border border-line rounded-lg p-6 mb-6 grid grid-cols-2 md:grid-cols-3 gap-5">
        <div>
          <div className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-1">Fee</div>
          <div className="font-display text-base font-semibold">₦100,000 <span className="text-ink-faint font-normal text-sm">or</span> ₦200,000</div>
          <div className="text-ink-faint text-xs mt-0.5">32-page (5yr) or 64-page (10yr)</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-1">Processing time</div>
          <div className="font-display text-base font-semibold">4 to 6 weeks</div>
          <div className="text-ink-faint text-xs mt-0.5">Regular service</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-1">Validity</div>
          <div className="font-display text-base font-semibold">5 or 10 years</div>
          <div className="text-ink-faint text-xs mt-0.5">Matches booklet type chosen</div>
        </div>
      </div>
      <p className="text-ink-faint text-xs mb-6 -mt-3">
        Fees shown are for applications within Nigeria (diaspora pricing differs). Last verified
        September 2026 against the official NIS fee schedule, confirm on passport.immigration.gov.ng
        before paying, since fees have changed more than once in recent years.
      </p>

      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 className="font-display text-lg">How to apply</h2>
          <a
            href="https://passport.immigration.gov.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-xs px-4 py-2 rounded-md"
          >
            Apply on the official NIS portal ↗
          </a>
        </div>
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.step_number} className="flex gap-3">
              <span className="font-mono text-xs font-bold text-green-mid flex-shrink-0 w-5">
                {s.step_number}.
              </span>
              <div>
                <div className="font-semibold text-sm">{s.title}</div>
                {s.description && <div className="text-ink-soft text-sm mt-0.5">{s.description}</div>}
              </div>
            </li>
          ))}
        </ol>
        <p className="text-ink-faint text-xs mt-4">
          Summarized from the Nigeria Immigration Service&rsquo;s own published process. Everything
          here happens on their portal, this app only helps you track your own checklist and
          progress alongside it.
        </p>
      </div>

      {!application ? (
        <div className="bg-panel border border-line rounded-lg p-8 text-center">
          <p className="text-ink-soft text-sm mb-5 max-w-md mx-auto">
            You haven&rsquo;t started a passport application yet. Starting one creates a real
            row in your Supabase database and begins tracking your progress.
          </p>
          <StartApplicationButton action={startPassportApplication} label="Start Passport Application" />
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-green-deep to-navy text-white rounded-lg p-6 mb-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10.5px] tracking-widest uppercase text-gold-soft mb-2">
                Overall progress
              </div>
              <h2 className="font-display text-lg">{application.completion_percent}% complete</h2>
              <p className="text-white/70 text-sm mt-1">
                Status:{" "}
                <span className="font-semibold text-white capitalize">
                  {application.status.replace("_", " ")}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg p-6 mb-6">
            <h2 className="font-display text-lg mb-1">NIN Match Checker</h2>
            <p className="text-ink-soft text-sm mb-4">
              Your application name must match your NIN record exactly. Check both against each
              other below, this runs entirely in your browser; nothing is sent anywhere.
            </p>
            <NinChecker />
          </div>

          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="font-display text-lg mb-4">Document Checklist</h2>
            <PassportChecklist
              applicationId={application.id}
              requirements={requirements}
              checklistState={(application.checklist_state as Record<string, boolean>) || {}}
            />
          </div>
        </>
      )}
    </div>
  );
}
