"use client";

import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";
import { nodeTypes, type SimNodeData } from "./nodes";
import type { SimulationSpec } from "@/lib/simulation/types";

/** Map a spec's nodes to React Flow nodes, applying stage active/dimmed state. */
export function specToFlowNodes(
  spec: SimulationSpec,
  opts: { stageActive: boolean; activeNodeIds: string[] }
): Node[] {
  const active = new Set(opts.activeNodeIds);
  return spec.nodes.map((n) => {
    const data: SimNodeData = {
      label: n.label,
      kind: n.kind,
      description: n.description,
      active: opts.stageActive ? active.has(n.id) : false,
      dimmed: opts.stageActive ? !active.has(n.id) : false,
    };
    return {
      id: n.id,
      type: "sim",
      position: n.position,
      data: data as unknown as Record<string, unknown>,
    };
  });
}

/** Map a spec's edges to themed React Flow edges, animating the active ones. */
export function specToFlowEdges(
  spec: SimulationSpec,
  opts: { stageActive: boolean; activeEdgeIds: string[] }
): Edge[] {
  const active = new Set(opts.activeEdgeIds);
  return spec.edges.map((e) => {
    const isActive = opts.stageActive && active.has(e.id);
    const flowing = isActive || (!opts.stageActive && Boolean(e.animated));
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: flowing,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? "var(--accent-teal)" : "var(--muted-foreground)",
      },
      style: {
        stroke: isActive ? "var(--accent-teal)" : "var(--muted-foreground)",
        strokeWidth: isActive ? 2 : 1.5,
        opacity: opts.stageActive && !isActive ? 0.35 : 1,
      },
      labelStyle: { fill: "var(--foreground)", fontSize: 11 },
      labelBgStyle: { fill: "var(--card)" },
    };
  });
}

/**
 * Read-only / preview canvas. The builder renders its own editable ReactFlow
 * but reuses the same `nodeTypes` and the mappers above for a consistent look.
 */
export function SimulationCanvas({
  spec,
  stageActive = false,
  activeNodeIds = [],
  activeEdgeIds = [],
  interactive = true,
  showControls = true,
  onNodeClick,
}: {
  spec: SimulationSpec;
  stageActive?: boolean;
  activeNodeIds?: string[];
  activeEdgeIds?: string[];
  interactive?: boolean;
  showControls?: boolean;
  onNodeClick?: (id: string) => void;
}) {
  const nodes = specToFlowNodes(spec, { stageActive, activeNodeIds });
  const edges = specToFlowEdges(spec, { stageActive, activeEdgeIds });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={interactive}
      zoomOnScroll={interactive}
      zoomOnPinch={interactive}
      zoomOnDoubleClick={interactive}
      preventScrolling={interactive}
      onNodeClick={(_, node) => onNodeClick?.(node.id)}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={18}
        size={1}
        color="var(--border)"
      />
      {showControls && <Controls showInteractive={false} />}
    </ReactFlow>
  );
}
