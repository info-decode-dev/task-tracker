"use client";

import { TaskItem } from "@/components/task-item";
import { getBookmarkStyle } from "@/lib/section-bookmarks";
import type { DayTaskEntry } from "@/lib/day-tasks";
import type { AssigneeOption, WorkspaceClientProps } from "@/lib/types";
import { cn } from "@/lib/utils";

type DayTasksViewProps = {
  entries: DayTaskEntry[];
  assignees: AssigneeOption[];
  permissions: WorkspaceClientProps["permissions"];
};

function formatTodayHeading() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function DayTasksView({
  entries,
  assignees,
  permissions,
}: DayTasksViewProps) {
  const openCount = entries.filter((e) => !e.task.completed).length;

  return (
    <div className="flex w-full flex-1 flex-col gap-4 py-2">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Day to Day</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatTodayHeading()}
          {entries.length > 0
            ? ` · ${openCount} open, ${entries.length - openCount} done`
            : ""}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center">
          <p className="text-sm font-medium">Nothing due today</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks with today&apos;s deadline will show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map(({ task, section }, index) => {
            const style = getBookmarkStyle(section.color, index);
            const Icon = style.icon;

            return (
              <li key={task.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                      style.bg,
                      style.text,
                    )}
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                  </span>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {section.title}
                  </span>
                </div>
                <TaskItem
                  task={task}
                  section={section}
                  assignees={assignees}
                  permissions={permissions}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
