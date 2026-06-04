import { cn } from "@/lib/utils";

type SectionPriorityBadgeProps = {
  className?: string;
};

export function SectionPriorityBadge({ className }: SectionPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2",
        "rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5",
        "text-[10px] font-semibold uppercase tracking-wide shadow-sm",
        "dark:border-amber-700/60 dark:bg-amber-950",
        className,
      )}
    >
      <span className="priority-shiny-text">Priority</span>
    </span>
  );
}
