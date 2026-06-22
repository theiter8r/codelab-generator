"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { labMetaSchema, parseTags } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { TiptapDoc } from "@/lib/types";

export type ActionState = { error?: string } | null;

/** Ensure slug uniqueness by appending a short suffix on collision. */
async function uniqueSlug(base: string, excludeId?: string) {
  const supabase = await createClient();
  const slug = base || "lab";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const { data } = await supabase
      .from("labs")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function createLab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = labMetaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const slug = await uniqueSlug(slugify(v.title));

  const { data, error } = await supabase
    .from("labs")
    .insert({
      author_id: admin.id,
      title: v.title,
      slug,
      summary: v.summary || null,
      difficulty: v.difficulty,
      est_minutes: v.est_minutes ?? null,
      tags: parseTags(v.tags),
      cover_image_url: v.cover_image_url || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin");
  redirect(`/admin/labs/${data.id}/edit`);
}

export async function updateLab(
  labId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = labMetaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("labs")
    .update({
      title: v.title,
      summary: v.summary || null,
      difficulty: v.difficulty,
      est_minutes: v.est_minutes ?? null,
      tags: parseTags(v.tags),
      cover_image_url: v.cover_image_url || null,
    })
    .eq("id", labId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/labs/${labId}/edit`);
  revalidatePath("/admin");
  return { error: undefined };
}

export async function setLabPublished(labId: string, publish: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("labs")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", labId);
  revalidatePath("/admin");
  revalidatePath(`/admin/labs/${labId}/edit`);
  revalidatePath("/labs");
}

export async function deleteLab(labId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("labs").delete().eq("id", labId);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function createStep(labId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("lab_steps")
    .select("position")
    .eq("lab_id", labId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (last?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from("lab_steps")
    .insert({ lab_id: labId, position: nextPos, title: `Step ${nextPos}` })
    .select("id")
    .single();

  if (error) return;
  revalidatePath(`/admin/labs/${labId}/edit`);
  redirect(`/admin/labs/${labId}/steps/${data.id}/edit`);
}

export async function updateStep(
  stepId: string,
  labId: string,
  payload: { title: string; content: TiptapDoc; hint: TiptapDoc }
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("lab_steps")
    .update({
      title: payload.title.trim() || "Untitled step",
      content: payload.content,
      hint: payload.hint,
    })
    .eq("id", stepId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/labs/${labId}/edit`);
  return { ok: true };
}

/** Assign a step to a module (or clear it with null). */
export async function setStepModule(
  stepId: string,
  labId: string,
  moduleId: string | null
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("lab_steps")
    .update({ module_id: moduleId })
    .eq("id", stepId);
  revalidatePath(`/admin/labs/${labId}/edit`);
}

// Modules -------------------------------------------------------------------

export async function createModule(labId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("lab_modules")
    .select("position")
    .eq("lab_id", labId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (last?.position ?? 0) + 1;
  await supabase
    .from("lab_modules")
    .insert({ lab_id: labId, position: nextPos, title: `Module ${nextPos}` });

  revalidatePath(`/admin/labs/${labId}/edit`);
}

export async function updateModule(
  moduleId: string,
  labId: string,
  payload: { title: string; description?: string }
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("lab_modules")
    .update({
      title: payload.title.trim() || "Untitled module",
      description: payload.description?.trim() || null,
    })
    .eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/labs/${labId}/edit`);
  return { ok: true };
}

export async function deleteModule(moduleId: string, labId: string) {
  await requireAdmin();
  const supabase = await createClient();
  // Steps in this module become unassigned (ON DELETE SET NULL).
  await supabase.from("lab_modules").delete().eq("id", moduleId);
  revalidatePath(`/admin/labs/${labId}/edit`);
}

/** Swap a module's position with its neighbour (move up/down). */
export async function moveModule(
  moduleId: string,
  labId: string,
  direction: "up" | "down"
) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("lab_modules")
    .select("id, position")
    .eq("lab_id", labId)
    .order("position", { ascending: true });

  if (!modules) return;
  const idx = modules.findIndex((m) => m.id === moduleId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= modules.length) return;

  const a = modules[idx];
  const b = modules[swapIdx];

  // Temp position to avoid violating unique(lab_id, position).
  await supabase.from("lab_modules").update({ position: -1 }).eq("id", a.id);
  await supabase.from("lab_modules").update({ position: a.position }).eq("id", b.id);
  await supabase.from("lab_modules").update({ position: b.position }).eq("id", a.id);

  revalidatePath(`/admin/labs/${labId}/edit`);
}

export async function deleteStep(stepId: string, labId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("lab_steps").delete().eq("id", stepId);
  revalidatePath(`/admin/labs/${labId}/edit`);
  redirect(`/admin/labs/${labId}/edit`);
}

/** Swap a step's position with its neighbour (move up/down). */
export async function moveStep(
  stepId: string,
  labId: string,
  direction: "up" | "down"
) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from("lab_steps")
    .select("id, position")
    .eq("lab_id", labId)
    .order("position", { ascending: true });

  if (!steps) return;
  const idx = steps.findIndex((s) => s.id === stepId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= steps.length) return;

  const a = steps[idx];
  const b = steps[swapIdx];

  // Use a temporary position to avoid violating the unique(lab_id, position).
  await supabase.from("lab_steps").update({ position: -1 }).eq("id", a.id);
  await supabase.from("lab_steps").update({ position: a.position }).eq("id", b.id);
  await supabase.from("lab_steps").update({ position: b.position }).eq("id", a.id);

  revalidatePath(`/admin/labs/${labId}/edit`);
}
