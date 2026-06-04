"use client";

import { useState, useTransition } from "react";
import {
  renameSection,
  deleteSection,
  updateSectionColor,
  setSectionLocked,
} from "@/app/actions/tracker";
import { BookmarkColorPicker } from "@/components/bookmark-color-picker";
import { useRouter } from "next/navigation";
import type { BookmarkColorId } from "@/lib/section-bookmarks";
import { isBookmarkColorId } from "@/lib/section-bookmarks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTaskForm } from "@/components/add-task-form";
import { TaskItem } from "@/components/task-item";
import { canLockSection, canManageSection } from "@/lib/permissions";
import type {
  AssigneeOption,
  SectionWithTasks,
  TeamMember,
  WorkspaceClientProps,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Lock,
  LockOpen,
  MoreHorizontal,
  Palette,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export function SectionCard({
  section,
  allSections,
  assignees,
  permissions,
  teamMembers,
  onClose,
}: {
  section: SectionWithTasks;
  allSections: SectionWithTasks[];
  assignees: AssigneeOption[];
  permissions: WorkspaceClientProps["permissions"];
  teamMembers: TeamMember[];
  onClose?: () => void;
}) {
  const canManage = canManageSection(section, permissions);
  const canLock = canLockSection(permissions);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [changingColor, setChangingColor] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tasks = [...section.tasks].sort((a, b) => a.position - b.position);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleRename = () => {
    setError(null);
    startTransition(async () => {
      try {
        await renameSection(section.id, title);
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to rename section");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteSection(section.id);
    });
  };

  const cancelEdit = () => {
    setTitle(section.title);
    setIsEditing(false);
    setError(null);
  };

  const handleToggleLock = () => {
    startTransition(async () => {
      await setSectionLocked(section.id, !section.locked);
      router.refresh();
    });
  };

  const handleColorChange = (colorId: BookmarkColorId) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateSectionColor(section.id, colorId);
        setChangingColor(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update bookmark color",
        );
      }
    });
  };

  const sectionColor = isBookmarkColorId(section.color)
    ? section.color
    : "rose";
  const usedColorIds = allSections.map((s) => s.color);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm",
        isPending && "opacity-60",
      )}
    >
      <header className="border-b border-border/50 px-5 py-4 sm:px-6">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="h-10 border-0 bg-muted/50 text-lg font-medium shadow-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") cancelEdit();
              }}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEdit}
                disabled={isPending}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRename}
                disabled={isPending || !title.trim()}
              >
                <Check className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={!onClose}
              title={onClose ? "Close section" : undefined}
              className={cn(
                "min-w-0 flex-1 rounded-lg text-left transition-colors",
                onClose &&
                  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !onClose && "cursor-default",
              )}
            >
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {section.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {tasks.length === 0
                  ? "No tasks yet"
                  : `${completedCount} of ${tasks.length} done`}
                {tasks.length > 0 ? (
                  <span className="ml-2 tabular-nums text-foreground/70">
                    · {progress}%
                  </span>
                ) : null}
              </p>
              {!canManage ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  View only — admin section
                </p>
              ) : null}
            </button>

            <div className="flex shrink-0 items-center gap-0.5">
            {canLock ? (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 text-muted-foreground",
                  section.locked && "text-foreground",
                )}
                onClick={handleToggleLock}
                disabled={isPending}
                aria-label={section.locked ? "Unlock section" : "Lock section"}
                title={section.locked ? "Unlock for team" : "Lock from team"}
              >
                {section.locked ? (
                  <Lock className="h-4 w-4" aria-hidden />
                ) : (
                  <LockOpen className="h-4 w-4" aria-hidden />
                )}
              </Button>
            ) : null}
            {canManage ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                onClick={() => setShowActions((open) => !open)}
                aria-label="Section options"
                aria-expanded={showActions}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showActions ? (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[8.5rem] rounded-xl border bg-popover p-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        setShowActions(false);
                        setChangingColor(true);
                      }}
                    >
                      <Palette className="h-4 w-4" />
                      Change color
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        setShowActions(false);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Rename
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setShowActions(false);
                        handleDelete();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            ) : null}
            </div>
          </div>
        )}

        {changingColor && !isEditing && canManage ? (
          <div className="mt-4 rounded-xl border border-border/50 bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Bookmark color
              </span>
              <button
                type="button"
                onClick={() => setChangingColor(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Done
              </button>
            </div>
            <BookmarkColorPicker
              usedColorIds={usedColorIds}
              value={sectionColor}
              onChange={handleColorChange}
              excludeSectionId={section.id}
              sections={allSections}
            />
          </div>
        ) : null}

        {!isEditing && tasks.length > 0 ? (
          <div
            className="mt-4 h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-foreground/80 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </header>

      <div className="px-4 py-4 sm:px-5">
        {tasks.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Add your first task below
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  task={task}
                  section={section}
                  assignees={assignees}
                  permissions={permissions}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage ? (
      <footer className="w-full border-t border-border/50 bg-muted/15">
        <AddTaskForm
          sectionId={section.id}
          assignees={assignees}
          permissions={permissions}
          teamMembers={teamMembers}
        />
      </footer>
      ) : null}
    </article>
  );
}
