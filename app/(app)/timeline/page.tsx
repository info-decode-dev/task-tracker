import { AppShellPage } from "@/components/app-shell-page";
import { TimelineViewLoader } from "@/components/timeline-view-loader";
import { getTimelinePageData } from "@/lib/timeline-data";

export default async function TimelinePage() {
  let data;
  try {
    data = await getTimelinePageData();
  } catch (err) {
    return (
      <AppShellPage role="member">
        <p className="text-destructive">
          {err instanceof Error ? err.message : "Failed to load timeline"}
        </p>
      </AppShellPage>
    );
  }

  return (
    <AppShellPage role={data.ctx.role} teamMembers={data.teamMembers}>
      <TimelineViewLoader
        members={data.members}
        items={data.items}
        currentUserId={data.ctx.userId}
        isAdmin={data.ctx.isAdmin}
      />
    </AppShellPage>
  );
}
