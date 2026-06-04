"use client";

import { getBookmarkStyle } from "@/lib/section-bookmarks";
import { canAccessSection } from "@/lib/permissions";
import type { SectionWithTasks, WorkspaceClientProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

type SectionListItemProps = {
  section: SectionWithTasks;
  index: number;
  permissions: WorkspaceClientProps["permissions"];
  onOpen: () => void;
};

export function SectionListItem({
  section,
  index,
  permissions,
  onOpen,
}: SectionListItemProps) {
  const accessible = canAccessSection(section, permissions);
  const style = getBookmarkStyle(section.color, index);
  const Icon = style.icon;
  if (!accessible) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3",
          "opacity-50 saturate-0",
        )}
        aria-disabled
        title="This section is locked"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted",
            "text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
          {section.title}
        </span>
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          style.bg,
          style.text,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {section.title}
      </span>
      {section.locked && permissions.isAdmin ? (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </button>
  );
}
