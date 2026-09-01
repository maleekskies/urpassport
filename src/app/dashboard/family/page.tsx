import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { FamilyMembersClient } from "./FamilyMembersClient";

export default async function FamilyPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: members } = await supabase
    .from("family_members")
    .select("id, full_name, relationship, date_of_birth, notes")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / Family</div>
      <h1 className="font-display text-2xl mb-1">Family</h1>
      <p className="text-ink-soft text-sm mb-6">
        Manage passport and visa applications on behalf of dependants.
      </p>
      <FamilyMembersClient members={(members as any) || []} />
    </div>
  );
}
