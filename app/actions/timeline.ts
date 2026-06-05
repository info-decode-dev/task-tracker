"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedClient } from "@/lib/auth/context";
import type { TimelineStatus } from "@/lib/types";

const TIMELINE_PATH = "/timeline";

async function assertCanManageUser(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>["supabase"],
  ctx: Awaited<ReturnType<typeof getAuthenticatedClient>>["ctx"],
  targetUserId: string,
) {
  if (targetUserId === ctx.userId) return;

  if (!ctx.isAdmin) {
    throw new Error("You can only manage your own timeline");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, admin_id")
    .eq("id", targetUserId)
    .maybeSingle();

  if (
    !profile ||
    (profile.id !== ctx.workspaceId && profile.admin_id !== ctx.workspaceId)
  ) {
    throw new Error("Invalid workspace member");
  }
}

export async function createTimelineItem(
  ownerUserId: string,
  title: string,
  scheduledAt: string,
  description?: string,
) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Title is required");
  if (!scheduledAt) throw new Error("Date and time are required");

  const scheduled = new Date(scheduledAt);
  if (Number.isNaN(scheduled.getTime())) {
    throw new Error("Invalid date and time");
  }

  const { supabase, ctx } = await getAuthenticatedClient();
  await assertCanManageUser(supabase, ctx, ownerUserId);

  const { data: existing } = await supabase
    .from("timeline_items")
    .select("position")
    .eq("workspace_id", ctx.workspaceId)
    .eq("user_id", ownerUserId)
    .order("position", { ascending: false })
    .limit(1);

  const position =
    existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("timeline_items").insert({
    workspace_id: ctx.workspaceId,
    user_id: ownerUserId,
    title: trimmed,
    scheduled_at: scheduled.toISOString(),
    description: description?.trim() || null,
    position,
  });

  if (error) throw new Error(error.message);

  revalidatePath(TIMELINE_PATH);
}

export async function updateTimelineItem(
  id: string,
  fields: {
    title?: string;
    scheduledAt?: string;
    description?: string | null;
  },
) {
  const { supabase, ctx } = await getAuthenticatedClient();

  const { data: item } = await supabase
    .from("timeline_items")
    .select("user_id")
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId)
    .maybeSingle();

  if (!item) throw new Error("Timeline item not found");

  await assertCanManageUser(supabase, ctx, item.user_id);

  const updates: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (fields.title !== undefined) {
    const trimmed = fields.title.trim();
    if (!trimmed) throw new Error("Title is required");
    updates.title = trimmed;
  }

  if (fields.scheduledAt !== undefined) {
    const scheduled = new Date(fields.scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      throw new Error("Invalid date and time");
    }
    updates.scheduled_at = scheduled.toISOString();
  }

  if (fields.description !== undefined) {
    updates.description = fields.description?.trim() || null;
  }

  const { error } = await supabase
    .from("timeline_items")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(TIMELINE_PATH);
}

export async function setTimelineItemStatus(
  id: string,
  status: TimelineStatus,
) {
  const { supabase, ctx } = await getAuthenticatedClient();

  const { data: item } = await supabase
    .from("timeline_items")
    .select("user_id")
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId)
    .maybeSingle();

  if (!item) throw new Error("Timeline item not found");

  await assertCanManageUser(supabase, ctx, item.user_id);

  const { error } = await supabase
    .from("timeline_items")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(TIMELINE_PATH);
}

export async function deleteTimelineItem(id: string) {
  const { supabase, ctx } = await getAuthenticatedClient();

  const { data: item } = await supabase
    .from("timeline_items")
    .select("user_id")
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId)
    .maybeSingle();

  if (!item) throw new Error("Timeline item not found");

  await assertCanManageUser(supabase, ctx, item.user_id);

  const { error } = await supabase
    .from("timeline_items")
    .delete()
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(TIMELINE_PATH);
}
