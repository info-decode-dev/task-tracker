"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedClient } from "@/lib/auth/context";
import {
  canAccessSection,
  canManageSection,
  canManageTaskInSection,
  canToggleTask,
  canCreateAssignee,
  canLockSection,
} from "@/lib/permissions";
import {
  getDefaultBookmarkColor,
  isBookmarkColorId,
} from "@/lib/section-bookmarks";

export type CreateTaskOptions = {
  deadline: string;
  assigneeId?: string | null;
};

function parseDeadline(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Deadline is required");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Invalid deadline date");
  }
  const date = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid deadline date");
  }
  return trimmed;
}

async function getSectionForPermission(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  sectionId: string,
  workspaceId: string,
  ctx: Awaited<ReturnType<typeof getAuthenticatedClient>>["ctx"],
) {
  const { data, error } = await supabase
    .from("sections")
    .select("id, created_by, workspace_id, locked")
    .eq("id", sectionId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Section not found");
  if (!canAccessSection(data, ctx)) {
    throw new Error("This section is locked");
  }
  return data;
}

async function getTaskWithSection(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  taskId: string,
  workspaceId: string,
  ctx: Awaited<ReturnType<typeof getAuthenticatedClient>>["ctx"],
) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "*, section:sections(id, created_by, workspace_id, locked), assignee:assignees(id, name, linked_user_id)",
    )
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Task not found");
  const section = data.section as {
    id: string;
    created_by: string;
    locked: boolean;
  };
  if (!canAccessSection(section, ctx)) {
    throw new Error("This section is locked");
  }
  return data;
}

async function assertAssigneeInWorkspace(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  workspaceId: string,
  assigneeId: string,
) {
  const { data } = await supabase
    .from("assignees")
    .select("id")
    .eq("id", assigneeId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!data) {
    throw new Error("Invalid assignee");
  }
}

export async function createSection(
  title: string,
  color?: string,
  priority = false,
) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Section title is required");
  }

  const { supabase, ctx } = await getAuthenticatedClient();

  const { data: workspaceSections } = await supabase
    .from("sections")
    .select("position, color")
    .eq("workspace_id", ctx.workspaceId)
    .order("position", { ascending: false });

  const usedColors = (workspaceSections ?? []).map((s) => s.color);
  let sectionColor = color;

  if (sectionColor) {
    if (!isBookmarkColorId(sectionColor)) {
      throw new Error("Invalid bookmark color");
    }
    if (usedColors.includes(sectionColor)) {
      throw new Error("That bookmark color is already in use");
    }
  } else {
    sectionColor = getDefaultBookmarkColor(usedColors);
  }

  const position =
    workspaceSections?.[0]?.position != null
      ? workspaceSections[0].position + 1
      : 0;

  const { error } = await supabase.from("sections").insert({
    title: trimmed,
    user_id: ctx.workspaceId,
    workspace_id: ctx.workspaceId,
    created_by: ctx.userId,
    color: sectionColor,
    position,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function updateSectionColor(id: string, color: string) {
  if (!isBookmarkColorId(color)) {
    throw new Error("Invalid bookmark color");
  }

  const { supabase, ctx } = await getAuthenticatedClient();
  const section = await getSectionForPermission(
    supabase,
    id,
    ctx.workspaceId,
    ctx,
  );

  if (!canManageSection(section, ctx)) {
    throw new Error("You cannot manage this section");
  }

  const { data: others } = await supabase
    .from("sections")
    .select("id, color")
    .eq("workspace_id", ctx.workspaceId)
    .neq("id", id);

  if ((others ?? []).some((s) => s.color === color)) {
    throw new Error("That bookmark color is already in use");
  }

  const { error } = await supabase
    .from("sections")
    .update({ color })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function renameSection(id: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Section title is required");
  }

  const { supabase, ctx } = await getAuthenticatedClient();
  const section = await getSectionForPermission(
    supabase,
    id,
    ctx.workspaceId,
    ctx,
  );

  if (!canManageSection(section, ctx)) {
    throw new Error("You cannot manage this section");
  }

  const { error } = await supabase
    .from("sections")
    .update({ title: trimmed })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function setSectionLocked(id: string, locked: boolean) {
  const { supabase, ctx } = await getAuthenticatedClient();

  if (!canLockSection(ctx)) {
    throw new Error("Only admins can lock sections");
  }

  const { data: section, error: fetchError } = await supabase
    .from("sections")
    .select("id")
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!section) throw new Error("Section not found");

  const { error } = await supabase
    .from("sections")
    .update({ locked })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function setSectionPriority(id: string, priority: boolean) {
  const { supabase, ctx } = await getAuthenticatedClient();
  const section = await getSectionForPermission(
    supabase,
    id,
    ctx.workspaceId,
    ctx,
  );

  if (!canManageSection(section, ctx)) {
    throw new Error("You cannot manage this section");
  }

  const { error } = await supabase
    .from("sections")
    .update({ priority })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteSection(id: string) {
  const { supabase, ctx } = await getAuthenticatedClient();
  const section = await getSectionForPermission(
    supabase,
    id,
    ctx.workspaceId,
    ctx,
  );

  if (!canManageSection(section, ctx)) {
    throw new Error("You cannot manage this section");
  }

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function createAssignee(name: string, linkedUserId?: string | null) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Assignee name is required");
  }

  const { supabase, ctx } = await getAuthenticatedClient();

  if (!canCreateAssignee(ctx)) {
    throw new Error("Only admins can add assignees");
  }

  if (linkedUserId) {
    const { data: member } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", linkedUserId)
      .eq("admin_id", ctx.userId)
      .maybeSingle();

    if (!member) {
      throw new Error("Invalid team member");
    }
  }

  const { data, error } = await supabase
    .from("assignees")
    .insert({
      user_id: ctx.workspaceId,
      workspace_id: ctx.workspaceId,
      name: trimmed,
      linked_user_id: linkedUserId || null,
    })
    .select("id, name, linked_user_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That person is already on your assignee list");
    }
    throw new Error(error.message);
  }

  revalidatePath("/");
  return data;
}

export async function createTask(
  sectionId: string,
  title: string,
  options?: CreateTaskOptions,
) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Task title is required");
  }

  const { supabase, ctx } = await getAuthenticatedClient();
  const section = await getSectionForPermission(
    supabase,
    sectionId,
    ctx.workspaceId,
    ctx,
  );

  if (!canManageTaskInSection(section, ctx)) {
    throw new Error("You cannot add tasks to this section");
  }

  if (!options?.deadline) {
    throw new Error("Deadline is required");
  }
  const deadline = parseDeadline(options.deadline);

  if (options.assigneeId) {
    await assertAssigneeInWorkspace(supabase, ctx.workspaceId, options.assigneeId);
  }

  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("section_id", sectionId)
    .eq("workspace_id", ctx.workspaceId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("tasks").insert({
    section_id: sectionId,
    user_id: ctx.workspaceId,
    workspace_id: ctx.workspaceId,
    created_by: ctx.userId,
    title: trimmed,
    position,
    deadline,
    assignee_id: options.assigneeId || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function updateTask(
  id: string,
  fields: { deadline?: string | null; assigneeId?: string | null },
) {
  const { supabase, ctx } = await getAuthenticatedClient();
  const task = await getTaskWithSection(supabase, id, ctx.workspaceId, ctx);
  const section = task.section as {
    id: string;
    created_by: string;
    locked: boolean;
  };

  if (!canManageTaskInSection(section, ctx)) {
    throw new Error("You cannot edit this task");
  }

  if (fields.assigneeId) {
    await assertAssigneeInWorkspace(supabase, ctx.workspaceId, fields.assigneeId);
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      deadline:
        fields.deadline === undefined ? undefined : fields.deadline || null,
      assignee_id:
        fields.assigneeId === undefined ? undefined : fields.assigneeId || null,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function toggleTask(id: string, completed: boolean) {
  const { supabase, ctx } = await getAuthenticatedClient();
  const task = await getTaskWithSection(supabase, id, ctx.workspaceId, ctx);

  if (!canToggleTask(task, ctx)) {
    throw new Error("Only the assignee or admin can complete this task");
  }

  const completedBy = ctx.isAdmin ? "Admin" : ctx.displayName;

  const { error } = await supabase
    .from("tasks")
    .update(
      completed
        ? {
            completed: true,
            completed_at: new Date().toISOString(),
            completed_by: completedBy,
          }
        : {
            completed: false,
            completed_at: null,
            completed_by: null,
          },
    )
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const { supabase, ctx } = await getAuthenticatedClient();
  const task = await getTaskWithSection(supabase, id, ctx.workspaceId, ctx);
  const section = task.section as {
    id: string;
    created_by: string;
    locked: boolean;
  };

  if (!canManageTaskInSection(section, ctx)) {
    throw new Error("You cannot delete this task");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
