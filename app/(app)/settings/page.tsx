import { createClient } from "@/lib/supabase/server";
import { AppShellPage } from "@/components/app-shell-page";
import { NicheManager } from "@/components/niche-manager";
import { getAppShellData } from "@/lib/app-shell-data";
import type { WorkspaceNiche } from "@/lib/types";
import { hasEnvVars } from "@/lib/utils";

export default async function SettingsPage() {
  if (!hasEnvVars) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <p className="text-muted-foreground">Configure Supabase env vars first.</p>
      </main>
    );
  }

  let ctx;
  let teamMembers;
  try {
    ({ ctx, teamMembers } = await getAppShellData());
  } catch (err) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <p className="text-destructive">
          {err instanceof Error ? err.message : "Failed to load settings"}
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: niches } = ctx.isAdmin
    ? await supabase
        .from("workspace_niches")
        .select("id, message, position, created_at")
        .eq("workspace_id", ctx.workspaceId)
        .order("position", { ascending: true })
    : { data: [] };

  return (
    <AppShellPage role={ctx.role} teamMembers={teamMembers} className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
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
    </AppShellPage>
  );
}
