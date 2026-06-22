"use client";

import { useState, useTransition } from "react";
import { setStepModule } from "@/lib/actions/labs";
import type { LabModule } from "@/lib/types";

/** Dropdown to assign a step to a module (or leave it unassigned). */
export function StepModuleSelect({
  stepId,
  labId,
  modules,
  value,
}: {
  stepId: string;
  labId: string;
  modules: LabModule[];
  value: string | null;
}) {
  const [selected, setSelected] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Module"
      value={selected}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setSelected(next);
        startTransition(async () => {
          await setStepModule(stepId, labId, next || null);
        });
      }}
      className="h-7 max-w-[9rem] rounded-md border border-input bg-background px-2 text-xs text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
    >
      <option value="">No module</option>
      {modules.map((m) => (
        <option key={m.id} value={m.id}>
          {m.title}
        </option>
      ))}
    </select>
  );
}
