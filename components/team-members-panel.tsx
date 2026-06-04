"use client";

import { useState } from "react";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TeamMembersPanelProps = {
  members: TeamMember[];
};

export function TeamMembersPanel({ members }: TeamMembersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 rounded-full px-3 text-xs"
        onClick={() => setOpen(true)}
      >
        <Users className="h-3.5 w-3.5" aria-hidden />
        Team ({members.length})
      </Button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-labelledby="team-panel-title"
            className="fixed right-4 top-[4.5rem] z-50 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-2xl border border-border/80 bg-popover shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h2
                id="team-panel-title"
                className="text-sm font-semibold tracking-tight"
              >
                Team members
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close team panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="max-h-[min(60vh,20rem)] overflow-y-auto p-2">
              {members.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No team members yet. They appear here when they sign up.
                </li>
              ) : (
                members.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-lg px-3 py-2.5 hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">
                      {member.display_name ?? member.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <p className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
              New sign-ups join as members under your workspace.
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}
