"use client";

import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { KIND_META, type SimNodeKind } from "@/lib/simulation/types";
import { cn } from "@/lib/utils";

export type SimNodeData = {
  label: string;
  kind: SimNodeKind;
  description?: string;
  active?: boolean;
  dimmed?: boolean;
};

/** A themed component node: icon + label, accent ring when active in a stage. */
function SimulationNodeView({ data, selected }: NodeProps) {
  const d = data as unknown as SimNodeData;
  const meta = KIND_META[d.kind] ?? KIND_META.generic;
  const Icon = meta.icon;

  return (
    <div
      style={{ ["--node-accent" as string]: `var(${meta.accent})` }}
      className={cn(
        "flex min-w-32 items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-all duration-200 ease-[var(--ease-out)]",
        d.active
          ? "border-[var(--node-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--node-accent)_18%,transparent)]"
          : "border-border",
        d.dimmed && !d.active ? "opacity-40" : "opacity-100",
        selected && "ring-2 ring-ring"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-border !bg-muted-foreground"
      />
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md text-[var(--node-accent)]"
        style={{ background: "color-mix(in srgb, var(--node-accent) 14%, transparent)" }}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-tight">
          {d.label || meta.label}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-border !bg-muted-foreground"
      />
    </div>
  );
}

export const nodeTypes: NodeTypes = { sim: SimulationNodeView };
