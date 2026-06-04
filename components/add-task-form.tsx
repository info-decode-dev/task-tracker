"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createAssignee, createTask } from "@/app/actions/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getRemainingDaysLabel } from "@/lib/format-task-dates";
import type {
  AssigneeOption,
  TeamMember,
  WorkspaceClientProps,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, Loader2, Plus, User, UserPlus } from "lucide-react";

type AddTaskFormProps = {
  sectionId: string;
  assignees: AssigneeOption[];
  permissions: WorkspaceClientProps["permissions"];
  teamMembers: TeamMember[];
};

function FieldLabel({
  children,
  required,
  optional,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/80"
    >
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      ) : null}
      {optional ? (
        <span className="font-normal text-muted-foreground">(optional)</span>
      ) : null}
    </label>
  );
}

export function AddTaskForm({
  sectionId,
  assignees,
  permissions,
  teamMembers,
}: AddTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [linkMemberId, setLinkMemberId] = useState("");
  const [showAssigneeAdd, setShowAssigneeAdd] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const canAddAssignees = permissions.canManageAssignees;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const minDate = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const remainingPreview = deadline
    ? getRemainingDaysLabel(deadline, false)
    : null;

  const canSubmit = Boolean(title.trim() && deadline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deadline) {
      setError("Pick a deadline to create this task");
      return;
    }

    startTransition(async () => {
      try {
        await createTask(sectionId, title, {
          deadline,
          assigneeId: assigneeId || null,
        });
        setTitle("");
        setDeadline("");
        setAssigneeId("");
        setShowAssigneeAdd(false);
        setNewAssigneeName("");
        setExpanded(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
      }
    });
  };

  const handleAddAssignee = () => {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createAssignee(
          newAssigneeName,
          linkMemberId || null,
        );
        setAssigneeId(created.id);
        setNewAssigneeName("");
        setLinkMemberId("");
        setShowAssigneeAdd(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add assignee",
        );
      }
    });
  };

  const hasDetails = Boolean(deadline || assigneeId);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-none">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 sm:px-5"
        aria-expanded={expanded}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          New task
        </span>
        <span className="flex items-center gap-2">
          {!expanded && hasDetails ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              details set
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </button>

      {expanded ? (
      <div className="space-y-3 border-t border-border/40 pb-4">
      <div className="w-full border-b border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/40 px-4 py-2.5 sm:px-5">
          <FieldLabel htmlFor={`title-${sectionId}`}>Task</FieldLabel>
          <Input
            id={`title-${sectionId}`}
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid w-full gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <div
            className={cn(
              "rounded-lg border p-3 transition-colors",
              deadline
                ? "border-border/60 bg-muted/20"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <FieldLabel htmlFor={`deadline-${sectionId}`} required>
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              Deadline
            </FieldLabel>
            <Input
              id={`deadline-${sectionId}`}
              type="date"
              value={deadline}
              min={minDate}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isPending}
              required
              className="h-9 bg-background"
            />
            {remainingPreview ? (
              <p
                className={cn(
                  "mt-2 text-[11px] font-medium",
                  remainingPreview.includes("overdue")
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {remainingPreview}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Required for every new task
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <FieldLabel htmlFor={`assignee-${sectionId}`} optional>
              <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              Assign to
            </FieldLabel>
            <NativeSelect
              id={`assignee-${sectionId}`}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={isPending}
            >
              <option value="">No assignee</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </NativeSelect>

            {canAddAssignees && showAssigneeAdd ? (
              <div className="mt-2.5 space-y-2 rounded-lg border border-border/40 bg-background p-2">
                <Input
                  placeholder="Display name"
                  value={newAssigneeName}
                  onChange={(e) => setNewAssigneeName(e.target.value)}
                  disabled={isPending}
                  className="h-8 bg-background text-xs"
                />
                {teamMembers.length > 0 ? (
                  <NativeSelect
                    value={linkMemberId}
                    onChange={(e) => setLinkMemberId(e.target.value)}
                    disabled={isPending}
                    className="h-8 text-xs"
                  >
                    <option value="">Link to team account (optional)</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name ?? m.email}
                      </option>
                    ))}
                  </NativeSelect>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={handleAddAssignee}
                    disabled={isPending || !newAssigneeName.trim()}
                  >
                    Save assignee
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => {
                      setShowAssigneeAdd(false);
                      setNewAssigneeName("");
                      setLinkMemberId("");
                    }}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : canAddAssignees ? (
              <button
                type="button"
                onClick={() => setShowAssigneeAdd(true)}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <UserPlus className="h-3 w-3" aria-hidden />
                Add assignee
              </button>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Only admin can add assignees
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-4 sm:px-5">
        {!deadline ? (
          <p className="text-[11px] text-muted-foreground">
            Select a deadline to enable Add
          </p>
        ) : null}
        <Button
          type="submit"
          size="sm"
          className="h-10 w-full gap-1.5"
          disabled={isPending || !canSubmit}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add task
            </>
          )}
        </Button>
      </div>

      {error ? (
        <p className="px-4 text-sm text-destructive sm:px-5">{error}</p>
      ) : null}
      </div>
      ) : null}
    </form>
  );
}
