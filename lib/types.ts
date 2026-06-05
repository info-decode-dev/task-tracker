import type { Database } from "@/lib/database.types";

export type UserRole = "admin" | "member";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Assignee = Database["public"]["Tables"]["assignees"]["Row"];

export type AssigneeOption = Pick<Assignee, "id" | "name" | "linked_user_id">;

export type TaskWithAssignee = Task & {
  assignee: Pick<Assignee, "id" | "name" | "linked_user_id"> | null;
};

export type SectionWithTasks = Section & {
  tasks: TaskWithAssignee[];
};

export type TeamMember = Pick<
  Profile,
  "id" | "email" | "display_name" | "role" | "created_at"
>;

export type TimelineStatus = "hold" | "progress" | "complete";

export type TimelineItem = {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  scheduled_at: string;
  description: string | null;
  status: TimelineStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TimelineMember = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
};

export type WorkspaceNiche = {
  id: string;
  message: string;
  position: number;
  created_at: string;
};

export type WorkspaceClientProps = {
  permissions: {
    userId: string;
    role: UserRole;
    isAdmin: boolean;
    canManageAssignees: boolean;
    canViewTeam: boolean;
  };
};
