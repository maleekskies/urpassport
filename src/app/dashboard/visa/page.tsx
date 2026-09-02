import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { VisaAssistantClient } from "./VisaAssistantClient";

export const metadata: Metadata = {
  title: "Visa Assistant",
  description: "Visa requirements and application tracking for any destination country.",
};

export default async function VisaPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: applicationTypes } = await supabase
    .from("application_types")
    .select("id, destination, visa_subtype, display_name, document_requirements, common_pitfalls")
    .eq("category", "visa");

  const typeIds = (applicationTypes || []).map((t) => t.id);
  const { data: applications } = typeIds.length
    ? await supabase
        .from("applications")
        .select("id, application_type_id, checklist_state, completion_percent, status")
        .eq("user_id", user.id)
        .in("application_type_id", typeIds)
    : { data: [] };

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Visa Assistant</div>
      <h1 className="font-display text-2xl mb-1">Visa Assistant</h1>
      <p className="text-ink-soft text-sm mb-6">
        Pick any country. We&rsquo;ll show you exactly what your case needs.
      </p>
      <VisaAssistantClient
        applicationTypes={(applicationTypes as any) || []}
        applications={(applications as any) || []}
      />
    </div>
  );
}
