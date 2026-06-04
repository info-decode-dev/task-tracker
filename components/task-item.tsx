"use client";

import { useTransition } from "react";
import { toggleTask, deleteTask } from "@/app/actions/tracker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { Trash2 } from "lucide-react";

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      await toggleTask(task.id, checked);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-3 py-2 ${isPending ? "opacity-60" : ""}`}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        disabled={isPending}
      />
      <span
        className={`flex-1 text-sm ${task.completed ? "text-muted-foreground line-through" : ""}`}
      >
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Delete task ${task.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
