"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Record that the learner viewed a step. Keeps last_viewed_at fresh (dashboard
 * ordering) and advances current_step_position so "Resume" lands here.
 */
export async function touchProgress(labId: string, position: number) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("lab_progress").upsert(
    {
      user_id: user.id,
      lab_id: labId,
      current_step_position: position,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lab_id" }
  );
}

/** Set the learner's "with hints / without hints" preference for a lab. */
export async function setHintsEnabled(
  labId: string,
  enabled: boolean,
  slug: string
) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("lab_progress").upsert(
    {
      user_id: user.id,
      lab_id: labId,
      hints_enabled: enabled,
    },
    { onConflict: "user_id,lab_id" }
  );
  revalidatePath(`/labs/${slug}`, "layout");
}

/** Toggle a step's completion for the current learner. */
export async function setStepComplete(
  labId: string,
  stepId: string,
  completed: boolean,
  slug: string
) {
  const user = await getUser();
  if (!user) return { error: "Not signed in" };
  const supabase = await createClient();

  if (completed) {
    const { error } = await supabase.from("step_completions").upsert(
      { user_id: user.id, lab_id: labId, step_id: stepId },
      { onConflict: "user_id,step_id" }
    );
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("step_completions")
      .delete()
      .eq("user_id", user.id)
      .eq("step_id", stepId);
    if (error) return { error: error.message };
  }

  revalidatePath(`/labs/${slug}`, "layout");
  revalidatePath("/dashboard");
  return { ok: true };
}
