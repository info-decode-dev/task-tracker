"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedClient } from "@/lib/auth/context";

export async function createWorkspaceNiche(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Niche message is required");
  }

  const { supabase, ctx } = await getAuthenticatedClient();

  if (!ctx.isAdmin) {
    throw new Error("Only admins can add niches");
  }

  const { data: existing } = await supabase
    .from("workspace_niches")
    .select("position")
    .eq("workspace_id", ctx.workspaceId)
    .order("position", { ascending: false })
    .limit(1);

  const position =
    existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("workspace_niches").insert({
    workspace_id: ctx.workspaceId,
    message: trimmed,
    position,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/profile");
}

export async function deleteWorkspaceNiche(id: string) {
  const { supabase, ctx } = await getAuthenticatedClient();

  if (!ctx.isAdmin) {
    throw new Error("Only admins can remove niches");
  }

  const { error } = await supabase
    .from("workspace_niches")
    .delete()
    .eq("id", id)
    .eq("workspace_id", ctx.workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/profile");
}
