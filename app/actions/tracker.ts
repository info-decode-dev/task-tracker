"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function createSection(title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Section title is required");
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { data: existing } = await supabase
    .from("sections")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("sections").insert({
    title: trimmed,
    user_id: user.id,
    position,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function renameSection(id: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Section title is required");
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("sections")
    .update({ title: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteSection(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function createTask(sectionId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Task title is required");
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("section_id", sectionId)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing?.[0]?.position != null ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("tasks").insert({
    section_id: sectionId,
    user_id: user.id,
    title: trimmed,
    position,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function toggleTask(id: string, completed: boolean) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
