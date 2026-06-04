"use client";

import { useState, useTransition } from "react";
import { renameSection, deleteSection } from "@/app/actions/tracker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTaskForm } from "@/components/add-task-form";
import { TaskItem } from "@/components/task-item";
import type { SectionWithTasks } from "@/lib/types";
import { Pencil, Trash2, Check, X } from "lucide-react";

export function SectionCard({ section }: { section: SectionWithTasks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tasks = [...section.tasks].sort((a, b) => a.position - b.position);
  const completedCount = tasks.filter((t) => t.completed).length;

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

  return (
    <Card className={isPending ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <div className="flex flex-1 flex-col gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRename} disabled={isPending}>
                  <Check className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <CardTitle>{section.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {completedCount} of {tasks.length} completed
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                  aria-label={`Rename section ${section.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-label={`Delete section ${section.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
        <AddTaskForm sectionId={section.id} />
      </CardContent>
    </Card>
  );
}
