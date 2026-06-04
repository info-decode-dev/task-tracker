import { isDeadlineOverdue } from "@/lib/format-task-dates";
import { canAccessSection, type PermissionCtx } from "@/lib/permissions";
import type { SectionWithTasks } from "@/lib/types";

export type WorkspaceStats = {
  total: number;
  completed: number;
  priorityTasks: number;
  overdue: number;
};

export function computeWorkspaceStats(
  sections: SectionWithTasks[],
  ctx: PermissionCtx,
): WorkspaceStats {
  let total = 0;
  let completed = 0;
  let priorityTasks = 0;
  let overdue = 0;

  for (const section of sections) {
    if (!canAccessSection(section, ctx)) continue;

    for (const task of section.tasks) {
      total++;
      if (task.completed) completed++;
      if (section.priority) priorityTasks++;
      if (isDeadlineOverdue(task.deadline, task.completed)) overdue++;
    }
  }

  return { total, completed, priorityTasks, overdue };
}
