import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces: middleware.ts already redirects unauthenticated requests
  // away from /dashboard, but a Server Component should never trust that
  // alone — check again here before rendering anything user-specific.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      userName={profile?.full_name || user.email?.split("@")[0] || "there"}
      userEmail={profile?.email || user.email || ""}
    >
      {children}
    </AppShell>
  );
}
