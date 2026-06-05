import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { sortSectionsByPriority } from "@/lib/sort-sections";
import type { AssigneeOption, SectionWithTasks } from "@/lib/types";

export async function getWorkspaceData() {
  const ctx = await getAuthContext();
  const supabase = await createClient();

  const permissions = {
    userId: ctx.userId,
    role: ctx.role,
    isAdmin: ctx.isAdmin,
    canManageAssignees: ctx.isAdmin,
    canViewTeam: ctx.isAdmin,
  };

  const [
    { data: sections, error: sectionsError },
    { data: assignees, error: assigneesError },
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
    permissions.canViewTeam
      ? supabase
          .from("profiles")
          .select("id, email, display_name, role, created_at")
          .eq("admin_id", permissions.userId)
          .order("created_at", { ascending: true })
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
  ]);

  const error = sectionsError ?? assigneesError;
  if (error) throw new Error(error.message);

  const sortedSections = sortSectionsByPriority(
    (sections ?? []) as SectionWithTasks[],
  );

  return {
    ctx,
    permissions,
    sections: sortedSections,
    assignees: (assignees ?? []) as AssigneeOption[],
    teamMembers,
  };
}
