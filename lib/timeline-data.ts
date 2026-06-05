import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import type { TeamMember, TimelineItem, TimelineMember } from "@/lib/types";

export async function getTimelinePageData() {
  const ctx = await getAuthContext();
  const supabase = await createClient();

  const [{ data: items, error: itemsError }, teamMembers] = await Promise.all([
    supabase
      .from("timeline_items")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("scheduled_at", { ascending: true }),
    ctx.isAdmin
      ? supabase
          .from("profiles")
          .select("id, email, display_name, role, created_at")
          .eq("admin_id", ctx.userId)
          .order("created_at", { ascending: true })
          .then((r) => (r.data ?? []) as TeamMember[])
      : Promise.resolve([] as TeamMember[]),
  ]);

  if (itemsError) throw new Error(itemsError.message);

  const members: TimelineMember[] = [
    {
      id: ctx.userId,
      email: ctx.email,
      display_name: ctx.displayName,
      role: ctx.role,
    },
    ...(teamMembers ?? []).map((m) => ({
      id: m.id,
      email: m.email,
      display_name: m.display_name,
      role: m.role as TimelineMember["role"],
    })),
  ];

  return {
    ctx,
    members,
    items: (items ?? []) as TimelineItem[],
    teamMembers,
  };
}
