import type { ReactNode } from "react";
import type { WorkspaceStats } from "@/lib/workspace-stats";
import { cn } from "@/lib/utils";

type WorkspaceStatsTilesProps = {
  stats: WorkspaceStats;
  className?: string;
};

type StatTileConfig = {
  id: string;
  label: string;
  value: number;
  hint: string;
  dot: string;
  footer?: ReactNode;
};

export function WorkspaceStatsTiles({
  stats,
  className,
}: WorkspaceStatsTilesProps) {
  const completionPct =
    stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
  const open = stats.total - stats.completed;

  const tiles: StatTileConfig[] = [
    {
      id: "total",
      label: "Total",
      value: stats.total,
      hint: open > 0 ? `${open} open` : "All clear",
      dot: "bg-sky-500",
    },
    {
      id: "completed",
      label: "Done",
      value: stats.completed,
      hint: stats.total > 0 ? `${completionPct}%` : "—",
      dot: "bg-emerald-500",
      footer:
        stats.total > 0 ? (
          <div className="mx-auto mt-2.5 h-1 w-full max-w-[4.5rem] overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        ) : null,
    },
    {
      id: "priority",
      label: "Priority",
      value: stats.priorityTasks,
      hint: "Starred",
      dot: "bg-amber-500",
    },
    {
      id: "overdue",
      label: "Overdue",
      value: stats.overdue,
      hint: stats.overdue > 0 ? "Attention" : "On track",
      dot: stats.overdue > 0 ? "bg-rose-500" : "bg-muted-foreground/40",
    },
  ];

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
      aria-label="Workspace task statistics"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-border/80">
        {tiles.map((tile) => (
          <StatCell key={tile.id} {...tile} />
        ))}
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  hint,
  dot,
  footer,
}: StatTileConfig) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-4 text-center sm:py-5">
      <span
        className={cn("mb-2 h-1.5 w-1.5 shrink-0 rounded-full", dot)}
        aria-hidden
      />
      <p className="text-[2rem] font-light leading-none tracking-tight tabular-nums text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      {footer}
    </div>
  );
}
