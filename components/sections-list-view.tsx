"use client";

import { useRouter } from "next/navigation";
import { SectionListItem } from "@/components/section-list-item";
import { APP_ROUTES } from "@/lib/app-nav";
import type { SectionWithTasks, WorkspaceClientProps } from "@/lib/types";

type SectionsListViewProps = {
  sections: SectionWithTasks[];
  permissions: WorkspaceClientProps["permissions"];
};

export function SectionsListView({
  sections,
  permissions,
}: SectionsListViewProps) {
  const router = useRouter();

  if (sections.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No sections yet. Create one from Home.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-4 py-2">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Sections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sections.length} {sections.length === 1 ? "section" : "sections"}
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <li key={section.id}>
            <SectionListItem
              section={section}
              index={index}
              permissions={permissions}
              onOpen={() => {
                router.push(`${APP_ROUTES.home}?section=${section.id}`);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
