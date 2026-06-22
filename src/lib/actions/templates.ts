"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { templateMetaSchema } from "@/lib/validation";
import type { TiptapDoc } from "@/lib/types";

export type TemplateResult =
  | { error: string }
  | { ok: true; id: string };

/**
 * Create a reusable step-content template. Called both from the dedicated
 * editor page and from the "Save as template" shortcut inside the step editor,
 * so it takes an explicit payload rather than FormData.
 */
export async function createTemplate(payload: {
  name: string;
  description?: string;
  content: TiptapDoc;
}): Promise<TemplateResult> {
  const admin = await requireAdmin();
  const parsed = templateMetaSchema.safeParse({
    name: payload.name,
    description: payload.description ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("step_templates")
    .insert({
      author_id: admin.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      content: payload.content,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  return { ok: true, id: data.id };
}

export async function updateTemplate(
  templateId: string,
  payload: { name: string; description?: string; content: TiptapDoc }
): Promise<TemplateResult> {
  await requireAdmin();
  const parsed = templateMetaSchema.safeParse({
    name: payload.name,
    description: payload.description ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("step_templates")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      content: payload.content,
    })
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${templateId}/edit`);
  return { ok: true, id: templateId };
}

export async function deleteTemplate(templateId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("step_templates").delete().eq("id", templateId);
  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}
