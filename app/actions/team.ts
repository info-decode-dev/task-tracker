"use server";

import { getAuthenticatedClient } from "@/lib/auth/context";
import { canViewTeam } from "@/lib/permissions";

export async function listTeamMembers() {
  const { supabase, ctx } = await getAuthenticatedClient();

  if (!canViewTeam(ctx)) {
    throw new Error("Only admins can view the team");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .eq("admin_id", ctx.userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}
