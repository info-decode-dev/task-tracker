"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AddTimelineItemForm } from "@/components/add-timeline-item-form";
import { TimelineItemCard } from "@/components/timeline-item-card";
import { APP_ROUTES } from "@/lib/app-nav";
import type { TimelineItem, TimelineMember } from "@/lib/types";
import { cn } from "@/lib/utils";

type TimelineViewProps = {
  members: TimelineMember[];
  items: TimelineItem[];
  currentUserId: string;
  isAdmin: boolean;
};

function memberLabel(member: TimelineMember) {
  return member.display_name ?? member.email.split("@")[0] ?? "Member";
}

export function TimelineView({
  members,
  items,
  currentUserId,
  isAdmin,
}: TimelineViewProps) {
  const searchParams = useSearchParams();
  const requestedUserId = searchParams.get("user");

  const activeMemberId = useMemo(() => {
    if (!isAdmin) return currentUserId;
    if (
      requestedUserId &&
      members.some((member) => member.id === requestedUserId)
    ) {
      return requestedUserId;
    }
    return currentUserId;
  }, [isAdmin, currentUserId, requestedUserId, members]);

  const activeMember = members.find((m) => m.id === activeMemberId) ?? members[0];
  const canManage = isAdmin || activeMemberId === currentUserId;

  const memberItems = items
    .filter((item) => item.user_id === activeMemberId)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

  const openCount = memberItems.filter((i) => i.status !== "complete").length;

  return (
    <div className="flex w-full flex-1 flex-col gap-5 py-2">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Timeline</h1>
        <p className="shrink-0 text-right text-sm text-muted-foreground">
          What to do next
          {memberItems.length > 0 ? ` · ${openCount} open` : ""}
        </p>
      </header>

      {isAdmin && members.length > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Team member timelines"
        >
          {members.map((member) => {
            const active = member.id === activeMemberId;
            const href =
              member.id === currentUserId
                ? APP_ROUTES.timeline
                : `${APP_ROUTES.timeline}?user=${member.id}`;

            return (
              <Link
                key={member.id}
                href={href}
                role="tab"
                aria-selected={active}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-foreground/20 bg-foreground text-background"
                    : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {memberLabel(member)}
                {member.role === "admin" ? " · Admin" : ""}
              </Link>
            );
          })}
        </div>
      ) : null}

      {activeMember ? (
        <p className="text-xs text-muted-foreground">
          {isAdmin && activeMemberId !== currentUserId
            ? `Viewing ${memberLabel(activeMember)}'s timeline`
            : "Your personal plan"}
        </p>
      ) : null}

      <AddTimelineItemForm
        ownerUserId={activeMemberId}
        canManage={canManage}
      />

      {memberItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center">
          <p className="text-sm font-medium">No timeline items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add what you plan to do next with a date and time.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {memberItems.map((item, index) => (
            <li key={item.id}>
              <TimelineItemCard
                item={item}
                canManage={canManage}
                showConnector={index < memberItems.length - 1}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
