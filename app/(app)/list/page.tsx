import { AppShellPage } from "@/components/app-shell-page";
import { SectionsListView } from "@/components/sections-list-view";
import { getWorkspaceData } from "@/lib/workspace-data";

export default async function ListPage() {
  let data;
  try {
    data = await getWorkspaceData();
  } catch (err) {
    return (
      <AppShellPage role="member">
        <p className="text-destructive">
          {err instanceof Error ? err.message : "Failed to load sections"}
        </p>
      </AppShellPage>
    );
  }

  return (
    <AppShellPage role={data.ctx.role} teamMembers={data.teamMembers}>
      <SectionsListView
        sections={data.sections}
        permissions={data.permissions}
      />
    </AppShellPage>
  );
}
