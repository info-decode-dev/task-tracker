import type { AuthContext } from "@/lib/auth/context";
import type { Section, TaskWithAssignee, WorkspaceClientProps } from "@/lib/types";

export type PermissionCtx =
  | AuthContext
  | (WorkspaceClientProps["permissions"] & { userId: string });

export type SectionLike = Pick<Section, "created_by" | "locked">;
export type TaskLike = TaskWithAssignee & { section?: SectionLike };

function isAdmin(ctx: PermissionCtx): boolean {
  return "isAdmin" in ctx ? ctx.isAdmin : ctx.role === "admin";
}

function userId(ctx: PermissionCtx): string {
  return ctx.userId;
}

export function canAccessSection(
  section: SectionLike,
  ctx: PermissionCtx,
): boolean {
  if (isAdmin(ctx)) return true;
  return !section.locked;
}

export function canManageSection(
  section: SectionLike,
  ctx: PermissionCtx,
): boolean {
  if (isAdmin(ctx)) return true;
  if (section.locked) return false;
  return section.created_by === userId(ctx);
}

export function canLockSection(ctx: PermissionCtx): boolean {
  return isAdmin(ctx);
}

export function canManageTaskInSection(
  section: SectionLike,
  ctx: PermissionCtx,
): boolean {
  return canManageSection(section, ctx);
}

export function canToggleTask(task: TaskLike, ctx: PermissionCtx): boolean {
  if (isAdmin(ctx)) return true;
  return task.assignee?.linked_user_id === userId(ctx);
}

export function canCreateAssignee(ctx: PermissionCtx): boolean {
  return isAdmin(ctx);
}

export function canViewTeam(ctx: PermissionCtx): boolean {
  return isAdmin(ctx);
}
