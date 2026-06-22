"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { templateMetaSchema } from "@/lib/validation";
import { simulationSpecSchema, type SimulationSpec } from "@/lib/simulation/types";

export type SimulationResult = { error: string } | { ok: true; id: string };

/**
 * Save a simulation spec to the reusable library. Called from the builder's
 * "Save to library" action, so it takes an explicit payload (name + spec)
 * rather than FormData. The spec is validated so the library never stores a
 * malformed diagram.
 */
export async function saveSimulation(payload: {
  name: string;
  description?: string;
  spec: SimulationSpec;
}): Promise<SimulationResult> {
  const admin = await requireAdmin();

  const meta = templateMetaSchema.safeParse({
    name: payload.name,
    description: payload.description ?? "",
  });
  if (!meta.success) {
    return { error: meta.error.issues[0]?.message ?? "Invalid input" };
  }

  const spec = simulationSpecSchema.safeParse(payload.spec);
  if (!spec.success) {
    return { error: "This simulation is not valid yet." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simulations")
    .insert({
      author_id: admin.id,
      name: meta.data.name,
      description: meta.data.description || null,
      spec: spec.data,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/simulations");
  return { ok: true, id: data.id };
}

export async function deleteSimulation(simulationId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("simulations").delete().eq("id", simulationId);
  revalidatePath("/admin/simulations");
}
