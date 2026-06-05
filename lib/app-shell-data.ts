import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import type { TeamMember } from "@/lib/types";

export async function getAppShellData() {
  const ctx = await getAuthContext();
  const supabase = await createClient();

  const teamMembers: TeamMember[] = ctx.isAdmin
    ? (
        await supabase
          .from("profiles")
          .select("id, email, display_name, role, created_at")
          .eq("admin_id", ctx.userId)
          .order("created_at", { ascending: true })
      ).data ?? []
    : [];

  return { ctx, teamMembers };
}
