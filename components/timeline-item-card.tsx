"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteTimelineItem,
  setTimelineItemStatus,
} from "@/app/actions/timeline";
import { TimelineStatusButtons } from "@/components/timeline-status-buttons";
import { formatTimelineDateTime } from "@/lib/format-timeline";
import type { TimelineItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

type TimelineItemCardProps = {
  item: TimelineItem;
  canManage: boolean;
  showConnector?: boolean;
};

export function TimelineItemCard({
  item,
  canManage,
  showConnector = false,
}: TimelineItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (status: TimelineItem["status"]) => {
    if (!canManage || status === item.status) return;
    setError(null);
    startTransition(async () => {
      try {
        await setTimelineItemStatus(item.id, status);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteTimelineItem(item.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete item");
      }
    });
  };

  const isComplete = item.status === "complete";

  return (
    <article
      className={cn(
        "relative rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm transition-opacity",
        isPending && "opacity-60",
        isComplete && "opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-semibold tracking-tight",
              isComplete && "text-muted-foreground line-through",
            )}
          >
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatTimelineDateTime(item.scheduled_at)}
          </p>
          {item.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Delete timeline item"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        <TimelineStatusButtons
          value={item.status}
          onChange={handleStatusChange}
          disabled={!canManage || isPending}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      {showConnector ? (
        <div
          className="timeline-connector pointer-events-none absolute -bottom-3 left-1/2 z-10 h-3 -translate-x-1/2"
          aria-hidden
        />
      ) : null}
    </article>
  );
}
