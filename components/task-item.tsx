"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toggleTask, deleteTask, updateTask } from "@/app/actions/tracker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  canManageTaskInSection,
  canToggleTask,
} from "@/lib/permissions";
import type {
  AssigneeOption,
  Section,
  TaskWithAssignee,
  WorkspaceClientProps,
} from "@/lib/types";
import {
  formatTaskDateShort,
  getRemainingDaysLabel,
  isDeadlineOverdue,
} from "@/lib/format-task-dates";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, User } from "lucide-react";

type TaskItemProps = {
  task: TaskWithAssignee;
  section: Pick<Section, "created_by">;
  assignees: AssigneeOption[];
  permissions: WorkspaceClientProps["permissions"];
};

export function TaskItem({
  task,
  section,
  assignees,
  permissions,
}: TaskItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);

  const canManage = canManageTaskInSection(section, permissions);
  const canToggle = canToggleTask(task, permissions);

  const createdShort = formatTaskDateShort(task.created_at);
  const remaining = getRemainingDaysLabel(task.deadline, task.completed);
  const overdue = isDeadlineOverdue(task.deadline, task.completed);

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setActive(false);
        setAssigning(false);
        setEditingDetails(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [active]);

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      await toggleTask(task.id, checked);
      if (checked) {
        setActive(false);
        setAssigning(false);
        setEditingDetails(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  };

  const handleDeadlineChange = (value: string) => {
    startTransition(async () => {
      await updateTask(task.id, { deadline: value || null });
    });
  };

  const handleAssigneeChange = (value: string) => {
    startTransition(async () => {
      await updateTask(task.id, { assigneeId: value || null });
      setAssigning(false);
    });
  };

  const metaParts: { text: string; emphasis?: boolean; danger?: boolean }[] =
    [];

  if (createdShort) {
    metaParts.push({ text: createdShort });
  }
  if (!task.completed && remaining) {
    metaParts.push({
      text: remaining,
      emphasis: !overdue,
      danger: overdue,
    });
  }
  if (task.assignee) {
    metaParts.push({ text: task.assignee.name });
  }
  if (task.completed && task.completed_by) {
    metaParts.push({ text: `Done by ${task.completed_by}`, emphasis: true });
  }

  const handleBodyClick = () => {
    if (!canManage) return;
    setActive((open) => {
      if (open) {
        setAssigning(false);
        setEditingDetails(false);
      }
      return !open;
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-xl border bg-background/60 transition-all",
        active && canManage
          ? "border-foreground/20 bg-muted/25 shadow-sm ring-1 ring-ring/20"
          : "border-border/40",
        isPending && "opacity-50",
        task.completed && "bg-muted/15",
      )}
    >
      <div className="flex items-center gap-0 px-3 py-3 sm:px-4">
        <div
          className="flex shrink-0 items-center self-stretch border-r border-border/60 py-0.5 pr-3"
          onClick={(e) => e.stopPropagation()}
        >
          {canToggle ? (
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleToggle(checked === true)}
              disabled={isPending}
              className="h-5 w-5 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="h-5 w-5 shrink-0 rounded-md border border-border/80"
              aria-hidden
            />
          )}
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={handleBodyClick}
            className="min-w-0 flex-1 cursor-pointer space-y-1 pl-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-expanded={active}
          >
            <TaskContent
              task={task}
              metaParts={metaParts}
            />
          </button>
        ) : (
          <div className="min-w-0 flex-1 space-y-1 pl-3">
            <TaskContent task={task} metaParts={metaParts} />
          </div>
        )}
      </div>

      {active && canManage ? (
        <div className="border-t border-border/40 px-3 pb-3 pt-2 sm:px-4">
          {!task.completed && assigning ? (
            <div className="mb-2 space-y-2 rounded-lg border border-border/40 bg-background p-2.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Assign to
              </span>
              {assignees.length > 0 ? (
                <NativeSelect
                  value={task.assignee_id ?? ""}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-xs"
                  autoFocus
                >
                  <option value="">Choose assignee…</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </NativeSelect>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No assignees yet. Ask an admin to add team assignees.
                </p>
              )}
            </div>
          ) : null}

          {!task.completed && editingDetails ? (
            <div className="mb-2 space-y-2 rounded-lg border border-border/40 bg-background p-2.5">
              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Deadline
                </span>
                <Input
                  type="date"
                  value={task.deadline ?? ""}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  disabled={isPending}
                  className="h-8 bg-background text-xs"
                />
              </div>
            </div>
          ) : null}

          <div className="flex w-full items-stretch gap-1">
            {!task.completed ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 min-w-0 flex-1 gap-1.5 px-2 text-xs text-muted-foreground",
                    assigning && "bg-muted text-foreground",
                  )}
                  onClick={() => {
                    setAssigning((open) => !open);
                    setEditingDetails(false);
                  }}
                  disabled={isPending}
                  aria-pressed={assigning}
                >
                  <User className="h-3.5 w-3.5" />
                  {assigning ? "Close" : task.assignee ? "Reassign" : "Assign"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 min-w-0 flex-1 gap-1.5 px-2 text-xs text-muted-foreground",
                    editingDetails && "bg-muted text-foreground",
                  )}
                  onClick={() => {
                    setEditingDetails((open) => !open);
                    setAssigning(false);
                  }}
                  disabled={isPending}
                  aria-pressed={editingDetails}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {editingDetails ? "Close" : "Edit"}
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 min-w-0 flex-1 gap-1.5 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TaskContent({
  task,
  metaParts,
}: {
  task: TaskWithAssignee;
  metaParts: { text: string; emphasis?: boolean; danger?: boolean }[];
}) {
  return (
    <>
      <p
        className={cn(
          "text-sm font-medium leading-snug",
          task.completed && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </p>
      {metaParts.length > 0 ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {metaParts.map((part, index) => (
            <span key={`${part.text}-${index}`}>
              {index > 0 ? (
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
              ) : null}
              <span
                className={cn(
                  part.danger && "font-medium text-destructive",
                  part.emphasis && !part.danger && "text-foreground/70",
                )}
              >
                {part.text}
              </span>
            </span>
          ))}
        </p>
      ) : null}
    </>
  );
}
