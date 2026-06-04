"use client";

import { CheckSquare2 } from "lucide-react";
import { ProfileMenu } from "@/components/profile-menu";
import { TeamMembersPanel } from "@/components/team-members-panel";
import type { TeamMember, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavbarProps = {
  activeSectionTitle?: string | null;
  chromeHidden?: boolean;
  role?: UserRole;
  teamMembers?: TeamMember[];
};

export function Navbar({
  activeSectionTitle,
  chromeHidden = false,
  role,
  teamMembers = [],
}: NavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        "transition-transform duration-300 ease-in-out motion-reduce:transition-none",
        chromeHidden && "-translate-y-full pointer-events-none",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CheckSquare2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              Task Tracker
            </p>
            {activeSectionTitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {activeSectionTitle}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Your diary</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {role ? (
            <span
              className={cn(
                "hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline",
                role === "admin"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {role}
            </span>
          ) : null}
          {role === "admin" ? (
            <TeamMembersPanel members={teamMembers} />
          ) : null}
          <ProfileMenu role={role} />
        </div>
      </div>
    </header>
  );
}
