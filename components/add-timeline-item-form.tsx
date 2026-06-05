"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTimelineItem } from "@/app/actions/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";

function defaultDateTimeLocal() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

type AddTimelineItemFormProps = {
  ownerUserId: string;
  canManage: boolean;
};

export function AddTimelineItemForm({
  ownerUserId,
  canManage,
}: AddTimelineItemFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDateTimeLocal);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canManage) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createTimelineItem(
          ownerUserId,
          title,
          new Date(scheduledAt).toISOString(),
          description,
        );
        setTitle("");
        setDescription("");
        setScheduledAt(defaultDateTimeLocal());
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add next step
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm"
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="timeline-title">Title</Label>
          <Input
            id="timeline-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What to do next"
            required
            disabled={isPending}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timeline-when">Date & time</Label>
          <Input
            id="timeline-when"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            disabled={isPending}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timeline-desc">
            Description{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id="timeline-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes or context"
            disabled={isPending}
            rows={2}
            className={cn(
              "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            )}
          />
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending || !title.trim()}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </form>
  );
}
