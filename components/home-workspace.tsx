"use client";

import { useMemo, useState } from "react";
import { Bookmark, Plus } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { BookmarkRail } from "@/components/bookmark-rail";
import { CreateSectionPanel } from "@/components/create-section-panel";
import { SectionCard } from "@/components/section-card";
import { SectionListItem } from "@/components/section-list-item";
import { canAccessSection } from "@/lib/permissions";
import type {
  AssigneeOption,
  SectionWithTasks,
  TeamMember,
  WorkspaceClientProps,
} from "@/lib/types";
import { useScrollChrome } from "@/lib/use-scroll-chrome";
import { cn } from "@/lib/utils";

type HomeWorkspaceProps = {
  sections: SectionWithTasks[];
  assignees: AssigneeOption[];
  teamMembers: TeamMember[];
  permissions: WorkspaceClientProps["permissions"];
};

export function HomeWorkspace({
  sections,
  assignees,
  teamMembers,
  permissions,
}: HomeWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const chromeHidden = useScrollChrome();

  const permissionCtx = useMemo(
    () => ({ ...permissions, userId: permissions.userId }),
    [permissions],
  );

  const selectedSection = useMemo(() => {
    if (!selectedId) return null;
    const section = sections.find((s) => s.id === selectedId);
    if (!section || !canAccessSection(section, permissionCtx)) return null;
    return section;
  }, [selectedId, sections, permissionCtx]);

  const activeSectionId = selectedSection?.id ?? null;
  const usedColorIds = sections.map((s) => s.color);

  return (
    <div className="relative flex min-h-svh flex-col">
      <Navbar
        activeSectionTitle={selectedSection?.title ?? null}
        chromeHidden={chromeHidden}
        role={permissions.role}
        teamMembers={teamMembers}
      />

      <div className="relative min-h-0 flex-1">
        <main
          className={cn(
            "notebook-page mx-auto flex h-full w-full max-w-3xl flex-col px-4 pb-24 pt-[calc(3.5rem+2rem)] sm:px-8 sm:pb-10 sm:pt-[calc(3.5rem+2.5rem)]",
            activeSectionId && "pr-5 sm:pr-6",
          )}
        >
          {addSectionOpen ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <CreateSectionPanel
                usedColorIds={usedColorIds}
                onClose={() => setAddSectionOpen(false)}
              />
            </div>
          ) : selectedSection ? (
            <div className="transition-opacity duration-300">
              <SectionCard
                section={selectedSection}
                allSections={sections}
                assignees={assignees}
                permissions={permissions}
                teamMembers={teamMembers}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Bookmark className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-medium tracking-tight">Blank page</h2>
              <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                {sections.length > 0
                  ? "Choose a section below to open it."
                  : "Create your first section to get started."}
              </p>

              {sections.length > 0 ? (
                <ul className="mt-8 flex w-full max-w-sm flex-col gap-2">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <SectionListItem
                        section={section}
                        index={index}
                        permissions={permissions}
                        onOpen={() => {
                          setAddSectionOpen(false);
                          setSelectedId(section.id);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                onClick={() => setAddSectionOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                New section
              </button>
            </div>
          )}
        </main>

        {activeSectionId ? (
          <BookmarkRail
            sections={sections}
            selectedId={activeSectionId}
            permissions={permissions}
            chromeHidden={chromeHidden}
            onSelect={(id) => {
              setAddSectionOpen(false);
              setSelectedId(id);
            }}
            onAddClick={() => {
              setSelectedId(null);
              setAddSectionOpen(true);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
