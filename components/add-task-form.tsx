"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/app/actions/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddTaskForm({ sectionId }: { sectionId: string }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createTask(sectionId, title);
        setTitle("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" size="sm" disabled={isPending || !title.trim()}>
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
