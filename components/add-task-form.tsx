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
import { Calendar, Loader2, Plus, User, UserPlus } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="rounded-xl border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/40 px-3 py-2.5 sm:px-4">
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

        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
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

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {!deadline ? "Select a deadline to enable Add" : null}
        </p>
        <Button
          type="submit"
          size="sm"
          className="h-9 shrink-0 gap-1.5 px-4"
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
