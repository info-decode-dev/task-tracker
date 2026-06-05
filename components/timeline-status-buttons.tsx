"use client";

import type { TimelineStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: { value: TimelineStatus; label: string }[] = [
  { value: "hold", label: "Hold" },
  { value: "progress", label: "Progress" },
  { value: "complete", label: "Complete" },
];

type TimelineStatusButtonsProps = {
  value: TimelineStatus;
  onChange: (status: TimelineStatus) => void;
  disabled?: boolean;
};

export function TimelineStatusButtons({
  value,
  onChange,
  disabled = false,
}: TimelineStatusButtonsProps) {
  return (
    <div
      className="inline-flex w-full rounded-lg border border-border/70 bg-muted/30 p-0.5"
      role="group"
      aria-label="Timeline status"
    >
      {STATUSES.map((status) => {
        const active = value === status.value;

        return (
          <button
            key={status.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(status.value)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              active
                ? status.value === "complete"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : status.value === "progress"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}
