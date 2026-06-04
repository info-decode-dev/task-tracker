"use client";

import { useEffect, useState } from "react";
import { getBookmarkStyle } from "@/lib/section-bookmarks";
import { canAccessSection } from "@/lib/permissions";
import type { SectionWithTasks, WorkspaceClientProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const BOOKMARK_RADIUS = "rounded-tl-lg rounded-bl-lg";

type BookmarkRailProps = {
  sections: SectionWithTasks[];
  selectedId: string;
  permissions: WorkspaceClientProps["permissions"];
  onSelect: (id: string | null) => void;
  onAddClick: () => void;
  chromeHidden?: boolean;
  hasNicheBanner?: boolean;
};

export function BookmarkRail({
  sections,
  selectedId,
  permissions,
  onSelect,
  onAddClick,
  chromeHidden = false,
  hasNicheBanner = false,
}: BookmarkRailProps) {
  const [railEngaged, setRailEngaged] = useState(false);
  const dimBookmarks = !railEngaged;

  useEffect(() => {
    setRailEngaged(false);
  }, [selectedId]);

  const engageRail = () => setRailEngaged(true);

  return (
    <aside
      className={cn(
        "pointer-events-none fixed -right-0.5 z-40 flex w-5 sm:-right-1 sm:w-6",
        hasNicheBanner
          ? "top-[calc(3.5rem+2.75rem)] h-[calc(100svh-3.5rem-2.75rem)]"
          : "top-14 h-[calc(100svh-3.5rem)]",
        "transition-transform duration-300 ease-in-out motion-reduce:transition-none",
        chromeHidden && "translate-x-full pointer-events-none",
      )}
      aria-label="Section bookmarks"
      onPointerEnter={engageRail}
      onFocus={engageRail}
    >
      <div
        className="pointer-events-auto flex h-full w-full flex-col items-end justify-center gap-2 overflow-y-auto py-6 scrollbar-none"
        onPointerDown={engageRail}
      >
        <button
          type="button"
          onClick={() => {
            engageRail();
            onAddClick();
          }}
          aria-label="Add new section"
          title="New section"
          className={cn(
            "h-14 w-3.5 shrink-0 transition-all duration-300 sm:h-16 sm:w-4",
            BOOKMARK_RADIUS,
            "border border-r-0 border-teal-600/70 bg-teal-500",
            "shadow-sm hover:translate-x-0.5 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dimBookmarks ? "opacity-40 saturate-50" : "opacity-100",
          )}
        />

        {sections.map((section, index) => {
          const style = getBookmarkStyle(section.color, index);
          const isActive = selectedId === section.id;
          const accessible = canAccessSection(section, {
            ...permissions,
            userId: permissions.userId,
          });
          const lockedClass = !accessible
            ? "opacity-30 saturate-0 cursor-not-allowed"
            : dimBookmarks
              ? "opacity-35 saturate-50"
              : "opacity-100";

          if (!accessible) {
            return (
              <span
                key={section.id}
                title={`${section.title} (locked)`}
                aria-label={`${section.title} locked`}
                className={cn(
                  "h-14 w-3.5 shrink-0 sm:h-16 sm:w-4",
                  BOOKMARK_RADIUS,
                  "border border-r-0 border-border/60 bg-muted",
                  lockedClass,
                )}
              />
            );
          }

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                engageRail();
                onSelect(isActive ? null : section.id);
              }}
              title={section.title}
              aria-label={`Open section ${section.title}`}
              aria-pressed={isActive}
              className={cn(
                "h-14 w-3.5 shrink-0 transition-all duration-300 sm:h-16 sm:w-4",
                BOOKMARK_RADIUS,
                "border border-r-0 shadow-sm",
                style.bg,
                style.border,
                isActive && railEngaged
                  ? "translate-x-0.5 shadow-md ring-1 ring-white/40"
                  : "hover:translate-x-0.5 hover:shadow-md",
                lockedClass,
                isActive && !dimBookmarks && accessible && "translate-x-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
          );
        })}

        <button
          type="button"
          onClick={() => {
            engageRail();
            onSelect(null);
          }}
          aria-label="Close section"
          title="Close section"
          className={cn(
            "flex h-14 w-3.5 shrink-0 items-center justify-center transition-all duration-300 sm:h-16 sm:w-4",
            BOOKMARK_RADIUS,
            "border border-r-0 border-border/70 bg-muted/80 text-muted-foreground shadow-sm",
            "hover:translate-x-0.5 hover:bg-muted hover:text-foreground hover:shadow-md",
            dimBookmarks ? "opacity-40" : "opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
