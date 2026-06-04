import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type AuthContext = {
  userId: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  isAdmin: boolean;
  displayName: string;
};

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, admin_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    throw new Error(
      "Profile not found. Run supabase/migrations/004_roles_team.sql in the SQL editor.",
    );
  }

  const workspaceId =
    profile.role === "admin" ? profile.id : (profile.admin_id as string);

  if (!workspaceId) {
    throw new Error("Invalid team profile configuration");
  }

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    role: profile.role,
    workspaceId,
    isAdmin: profile.role === "admin",
    displayName:
      profile.display_name ??
      user.email?.split("@")[0] ??
      "User",
  };
}

export async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, admin_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) {
    throw new Error(
      "Profile not found. Run supabase/migrations/004_roles_team.sql in the SQL editor.",
    );
  }

  const workspaceId =
    profile.role === "admin" ? profile.id : (profile.admin_id as string);

  if (!workspaceId) {
    throw new Error("Invalid team profile configuration");
  }

  const ctx: AuthContext = {
    userId: user.id,
    email: user.email ?? profile.email,
    role: profile.role,
    workspaceId,
    isAdmin: profile.role === "admin",
    displayName:
      profile.display_name ?? user.email?.split("@")[0] ?? "User",
  };

  return { supabase, ctx };
}
