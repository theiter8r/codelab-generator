"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Workflow } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { deleteSimulation } from "@/lib/actions/simulations";
import { parseSpec, type SimulationSpec } from "@/lib/simulation/types";
import type { SavedSimulation } from "@/lib/types";

/**
 * Browse saved library simulations and insert one at the cursor. Simulations
 * are admin-only (RLS), and this editor only renders for the admin, so a direct
 * client query is safe.
 */
export function SimulationPicker({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (spec: SimulationSpec) => void;
}) {
  const [sims, setSims] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("simulations")
      .select("id, name, description, spec, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSims((data as SavedSimulation[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch simulations when the modal opens; load() sets its own loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) load();
  }, [open, load]);

  async function remove(id: string) {
    if (!window.confirm("Delete this simulation from your library?")) return;
    setSims((prev) => prev.filter((s) => s.id !== id));
    await deleteSimulation(id);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert from library"
      description="Drop a saved simulation into this step — it stays editable here."
    >
      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : sims.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border py-12 text-center">
          <Workflow className="size-7 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No saved simulations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a simulation, then use “Save to library” to reuse it later.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {sims.map((s) => {
            const spec = parseSpec(s.spec);
            return (
              <li
                key={s.id}
                className="flex items-stretch gap-2 rounded-lg border border-border bg-card transition-colors duration-150 ease-[var(--ease-out)] hover:border-ring hover:bg-muted/50"
              >
                <button
                  type="button"
                  onClick={() => {
                    onInsert(spec);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left active:scale-[0.99]"
                >
                  <Workflow className="mt-0.5 size-4 shrink-0 text-[var(--accent-purple)]" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.description
                        ? s.description
                        : `${spec.nodes.length} node${spec.nodes.length === 1 ? "" : "s"} · ${spec.stages.length} stage${spec.stages.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  aria-label={`Delete ${s.name}`}
                  title="Delete from library"
                  className="grid w-10 shrink-0 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive active:scale-[0.97]"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
