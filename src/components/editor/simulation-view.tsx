"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ReactFlowProvider } from "@xyflow/react";
import { Pencil, Trash2, Workflow } from "lucide-react";
import { SimulationPlayer } from "@/components/simulation/simulation-player";
import { SimulationCanvas } from "@/components/simulation/simulation-canvas";
import { SimulationBuilder } from "@/components/simulation/simulation-builder";
import { parseSpec } from "@/lib/simulation/types";

/**
 * Tiptap node view for a simulation. Read-only → the learner player. Editable →
 * a static preview with an "Edit" button that opens the visual builder; saving
 * writes the spec back via `updateAttributes`, which flows through the editor's
 * existing onUpdate → updateStep save path.
 */
export function SimulationView({
  node,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const spec = parseSpec(node.attrs.spec);
  const [editing, setEditing] = useState(false);

  if (!editor.isEditable) {
    return (
      <NodeViewWrapper>
        <SimulationPlayer spec={spec} />
      </NodeViewWrapper>
    );
  }

  const empty = spec.nodes.length === 0;

  return (
    <NodeViewWrapper className="my-6">
      <div
        contentEditable={false}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border bg-subtle px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Workflow className="size-4 text-[var(--accent-purple)]" />
            Simulation{spec.title ? `: ${spec.title}` : ""}
            <span className="text-xs font-normal text-muted-foreground">
              · {spec.nodes.length} node{spec.nodes.length === 1 ? "" : "s"} ·{" "}
              {spec.stages.length} stage{spec.stages.length === 1 ? "" : "s"}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.97]"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => deleteNode()}
              aria-label="Delete simulation"
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive active:scale-[0.97]"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="relative h-56">
          {empty ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="grid h-full w-full place-items-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <span className="flex flex-col items-center gap-2">
                <Workflow className="size-6" />
                Empty simulation — click to build
              </span>
            </button>
          ) : (
            <ReactFlowProvider>
              <SimulationCanvas
                spec={spec}
                interactive={false}
                showControls={false}
              />
            </ReactFlowProvider>
          )}
        </div>
      </div>

      {editing && (
        <SimulationBuilder
          initialSpec={spec}
          onClose={() => setEditing(false)}
          onSave={(next) => {
            updateAttributes({ spec: next });
            setEditing(false);
          }}
        />
      )}
    </NodeViewWrapper>
  );
}
