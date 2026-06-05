import { AppShellPage } from "@/components/app-shell-page";
import { DayTasksView } from "@/components/day-tasks-view";
import { collectDayTasks } from "@/lib/day-tasks";
import { getWorkspaceData } from "@/lib/workspace-data";

export default async function DayPage() {
  let data;
  try {
    data = await getWorkspaceData();
  } catch (err) {
    return (
      <AppShellPage role="member">
        <p className="text-destructive">
          {err instanceof Error ? err.message : "Failed to load tasks"}
        </p>
      </AppShellPage>
    );
  }

  const entries = collectDayTasks(data.sections, data.permissions);

  return (
    <AppShellPage role={data.ctx.role} teamMembers={data.teamMembers}>
      <DayTasksView
        entries={entries}
        assignees={data.assignees}
        permissions={data.permissions}
      />
    </AppShellPage>
  );
}
