import type { SectionWithTasks } from "@/lib/types";

export function sortSectionsByPriority(
  sections: SectionWithTasks[],
): SectionWithTasks[] {
  return [...sections].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority ? -1 : 1;
    }
    return a.position - b.position;
  });
}
