import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { HomeWorkspaceLoader } from "@/components/home-workspace-loader";
import { sortSectionsByPriority } from "@/lib/sort-sections";
import type { SectionWithTasks, WorkspaceNiche } from "@/lib/types";
import { hasEnvVars } from "@/lib/utils";

export default async function HomePage() {
  if (!hasEnvVars) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
        <p className="text-muted-foreground">
          Copy <code className="rounded bg-muted px-1">.env.example</code> to{" "}
          <code className="rounded bg-muted px-1">.env.local</code> and add your
          Supabase project URL and publishable key, then run the SQL migrations
          in <code className="rounded bg-muted px-1">supabase/migrations/</code>.
        </p>
      </main>
    );
  }

  let permissions;
  let workspaceId: string;
  try {
    const ctx = await getAuthContext();
    workspaceId = ctx.workspaceId;
    permissions = {
      userId: ctx.userId,
      role: ctx.role,
      isAdmin: ctx.isAdmin,
      canManageAssignees: ctx.isAdmin,
      canViewTeam: ctx.isAdmin,
    };
  } catch (err) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 md:p-10">
        <p className="text-destructive">
          {err instanceof Error
            ? err.message
            : "Failed to load your profile. Run migration 004_roles_team.sql in Supabase."}
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const [
    { data: sections, error: sectionsError },
    { data: assignees, error: assigneesError },
    { data: niches, error: nichesError },
    teamMembers,
  ] = await Promise.all([
    supabase
      .from("sections")
      .select("*, tasks(*, assignee:assignees(id, name, linked_user_id))")
      .order("position", { ascending: true })
      .order("position", { ascending: true, referencedTable: "tasks" }),
    supabase
      .from("assignees")
      .select("id, name, linked_user_id")
      .order("name"),
    supabase
      .from("workspace_niches")
      .select("id, message, position, created_at")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    permissions.canViewTeam
      ? supabase
          .from("profiles")
          .select("id, email, display_name, role, created_at")
          .eq("admin_id", permissions.userId)
          .order("created_at", { ascending: true })
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
  ]);

  const error = sectionsError ?? assigneesError ?? nichesError;

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 md:p-10">
        <p className="text-destructive">
          Failed to load workspace. Run all SQL files in{" "}
          <code className="rounded bg-muted px-1">supabase/migrations/</code>{" "}
          in the Supabase SQL editor.
        </p>
      </main>
    );
  }

  const sortedSections = sortSectionsByPriority(
    (sections ?? []) as SectionWithTasks[],
  );

  return (
    <Suspense fallback={null}>
      <HomeWorkspaceLoader
        sections={sortedSections}
        assignees={assignees ?? []}
        teamMembers={teamMembers}
        niches={(niches ?? []) as WorkspaceNiche[]}
        permissions={permissions}
      />
    </Suspense>
  );
}
