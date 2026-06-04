import type { Database } from "@/lib/database.types";

export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];

export type SectionWithTasks = Section & {
  tasks: Task[];
};
