"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionPriorityStarProps = {
  priority: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
};

export function SectionPriorityStar({
  priority,
  onToggle,
  disabled = false,
  className,
}: SectionPriorityStarProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-label={priority ? "Remove priority" : "Mark as priority"}
      aria-pressed={priority}
      title={priority ? "Priority section" : "Mark as priority"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
        "hover:bg-muted/60 hover:text-amber-600 disabled:pointer-events-none disabled:opacity-50",
        priority && "text-amber-500 hover:text-amber-600",
        className,
      )}
    >
      <Star
        className={cn(
          "h-4 w-4",
          priority && "fill-amber-400 text-amber-500",
        )}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
