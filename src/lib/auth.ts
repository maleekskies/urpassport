import { createClient } from "@/lib/supabase/server";

// Server Actions each need their own auth check. Throwing avoids a silent no-op.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
