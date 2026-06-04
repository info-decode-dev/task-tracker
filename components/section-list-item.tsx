"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSectionPriority } from "@/app/actions/tracker";
import { SectionPriorityBadge } from "@/components/section-priority-badge";
import { SectionPriorityStar } from "@/components/section-priority-star";
import { getBookmarkStyle } from "@/lib/section-bookmarks";
import { canAccessSection, canManageSection } from "@/lib/permissions";
import type { SectionWithTasks, WorkspaceClientProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock, Star } from "lucide-react";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const accessible = canAccessSection(section, permissions);
  const canManage = canManageSection(section, permissions);
  const style = getBookmarkStyle(section.color, index);
  const Icon = style.icon;

  const handlePriorityToggle = () => {
    startTransition(async () => {
      try {
        await setSectionPriority(section.id, !section.priority);
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  };
  if (!accessible) {
    return (
      <div
        className={cn(
          "relative w-full",
          section.priority && "mt-2.5",
        )}
      >
        {section.priority ? <SectionPriorityBadge /> : null}
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
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full",
        section.priority && "mt-2.5",
      )}
    >
      {section.priority ? <SectionPriorityBadge /> : null}
      <div className="flex w-full items-center rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
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
      </button>
      <div className="flex shrink-0 items-center gap-0 pr-0.5">
        {section.locked && permissions.isAdmin ? (
          <span className="flex h-9 w-7 items-center justify-center text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        {canManage ? (
          <SectionPriorityStar
            priority={section.priority}
            onToggle={handlePriorityToggle}
            disabled={isPending}
            className="h-9 w-8"
          />
        ) : section.priority ? (
          <span
            className="flex h-9 w-8 items-center justify-center"
            aria-hidden
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" strokeWidth={2} />
          </span>
        ) : null}
      </div>
      </div>
    </div>
  );
}
