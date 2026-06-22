"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { X } from "lucide-react";
import { SimulationCanvas } from "./simulation-canvas";
import { StageController } from "./stage-controller";
import { KIND_META, type SimulationSpec } from "@/lib/simulation/types";

/** Learner-facing player: guided stage playback + free pan/zoom exploration. */
export function SimulationPlayer({ spec }: { spec: SimulationSpec }) {
  const hasStages = spec.stages.length > 0;
  const [index, setIndex] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);

  if (spec.nodes.length === 0) {
    return (
      <div className="my-6 grid place-items-center rounded-xl border border-dashed border-border py-12 text-sm text-muted-foreground">
        This simulation is empty.
      </div>
    );
  }

  const stage = hasStages
    ? spec.stages[Math.min(index, spec.stages.length - 1)]
    : null;
  const detail = detailId ? spec.nodes.find((n) => n.id === detailId) : null;
  const DetailIcon = detail ? KIND_META[detail.kind].icon : null;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-subtle">
      <div className="relative h-[clamp(320px,52vh,540px)]">
        <ReactFlowProvider>
          <SimulationCanvas
            spec={spec}
            stageActive={hasStages}
            activeNodeIds={stage?.activeNodeIds ?? []}
            activeEdgeIds={stage?.activeEdgeIds ?? []}
            onNodeClick={setDetailId}
          />
        </ReactFlowProvider>

        {detail && DetailIcon && (
          <div className="absolute right-3 top-3 z-10 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg [animation:menu-in_140ms_var(--ease-out)]">
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <DetailIcon className="size-4 text-[var(--accent-teal)]" />
                {detail.label}
              </span>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                aria-label="Close"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {detail.description || "No description provided."}
            </p>
          </div>
        )}
      </div>

      {hasStages && (
        <StageController stages={spec.stages} index={index} onIndex={setIndex} />
      )}
    </div>
  );
}
