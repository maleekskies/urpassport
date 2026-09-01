import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { startPassportApplication } from "./actions";
import { PassportChecklist } from "./PassportChecklist";
import { StartApplicationButton } from "@/components/StartApplicationButton";
import { NinChecker } from "./NinChecker";

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

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Passport Hub</div>
      <h1 className="font-display text-2xl mb-6">Nigerian Passport</h1>

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
              other below — this runs entirely in your browser; nothing is sent anywhere.
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
