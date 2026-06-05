import { isDeadlineToday } from "@/lib/format-task-dates";
import { canAccessSection } from "@/lib/permissions";
import type {
  SectionWithTasks,
  TaskWithAssignee,
  WorkspaceClientProps,
} from "@/lib/types";

export type DayTaskEntry = {
  task: TaskWithAssignee;
  section: Pick<
    SectionWithTasks,
    "id" | "title" | "color" | "created_by" | "locked"
  >;
};

export function collectDayTasks(
  sections: SectionWithTasks[],
  permissions: WorkspaceClientProps["permissions"],
): DayTaskEntry[] {
  const entries: DayTaskEntry[] = [];

  for (const section of sections) {
    if (!canAccessSection(section, permissions)) continue;

    for (const task of section.tasks) {
      if (!isDeadlineToday(task.deadline)) continue;

      entries.push({
        task,
        section: {
          id: section.id,
          title: section.title,
          color: section.color,
          created_by: section.created_by,
          locked: section.locked,
        },
      });
    }
  }

  return entries.sort((a, b) => {
    if (a.task.completed !== b.task.completed) {
      return a.task.completed ? 1 : -1;
    }
    return a.task.position - b.task.position;
  });
}
