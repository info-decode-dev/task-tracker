import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { Navbar } from "@/components/navbar";
import { NicheManager } from "@/components/niche-manager";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import type { WorkspaceNiche } from "@/lib/types";
import { hasEnvVars } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  if (!hasEnvVars) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <p className="text-muted-foreground">Configure Supabase env vars first.</p>
      </main>
    );
  }

  let ctx;
  try {
    ctx = await getAuthContext();
  } catch (err) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <p className="text-destructive">
          {err instanceof Error ? err.message : "Failed to load profile"}
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const [{ data: niches }, teamMembers] = await Promise.all([
    supabase
      .from("workspace_niches")
      .select("id, message, position, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("position", { ascending: true }),
    ctx.isAdmin
      ? supabase
          .from("profiles")
          .select("id, email, display_name, role, created_at")
          .eq("admin_id", ctx.userId)
          .order("created_at", { ascending: true })
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
  ]);

  const permissions = {
    userId: ctx.userId,
    role: ctx.role,
    isAdmin: ctx.isAdmin,
    canManageAssignees: ctx.isAdmin,
    canViewTeam: ctx.isAdmin,
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      <Navbar role={ctx.role} teamMembers={teamMembers} />

      <main className="notebook-page mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-[calc(3.5rem+2rem)] sm:px-8 sm:pt-[calc(3.5rem+2.5rem)]">
        <Link
          href={AUTH_ROUTES.home}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to workspace
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <dl className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-card p-5 text-sm shadow-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{ctx.displayName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{ctx.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium capitalize">{ctx.role}</dd>
            </div>
          </dl>
        </header>

        {ctx.isAdmin ? (
          <NicheManager niches={(niches ?? []) as WorkspaceNiche[]} />
        ) : null}
      </main>
    </div>
  );
}
