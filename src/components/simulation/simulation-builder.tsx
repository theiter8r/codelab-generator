"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  type Edge,
  type OnConnect,
} from "@xyflow/react";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import { nodeTypes, type SimNodeData } from "./nodes";
import { specToFlowEdges, specToFlowNodes } from "./simulation-canvas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  KIND_META,
  SIM_NODE_KINDS,
  simId,
  type SimNodeKind,
  type SimStage,
  type SimulationSpec,
} from "@/lib/simulation/types";

export function SimulationBuilder({
  initialSpec,
  onSave,
  onClose,
}: {
  initialSpec: SimulationSpec;
  onSave: (spec: SimulationSpec) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Simulation builder"
      description="Drag to position, drag handle-to-handle to connect, then define stages."
      className="h-[85dvh] max-w-6xl"
    >
      <ReactFlowProvider>
        <BuilderInner initialSpec={initialSpec} onSave={onSave} onClose={onClose} />
      </ReactFlowProvider>
    </Modal>
  );
}

function BuilderInner({
  initialSpec,
  onSave,
  onClose,
}: {
  initialSpec: SimulationSpec;
  onSave: (spec: SimulationSpec) => void;
  onClose: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    specToFlowNodes(initialSpec, { stageActive: false, activeNodeIds: [] })
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    specToFlowEdges(initialSpec, { stageActive: false, activeEdgeIds: [] })
  );
  const [stages, setStages] = useState<SimStage[]>(initialSpec.stages);
  const [tab, setTab] = useState<"build" | "stages">("build");
  const [selNode, setSelNode] = useState<string | null>(null);
  const [selEdge, setSelEdge] = useState<string | null>(null);
  const [selStage, setSelStage] = useState<string | null>(null);

  // Reflect the selected stage's membership as active/dimmed styling.
  useEffect(() => {
    const stage = stages.find((s) => s.id === selStage) ?? null;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          active: stage ? stage.activeNodeIds.includes(n.id) : false,
          dimmed: stage ? !stage.activeNodeIds.includes(n.id) : false,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => {
        const isActive = stage ? stage.activeEdgeIds.includes(e.id) : false;
        return {
          ...e,
          animated: isActive,
          style: {
            ...e.style,
            stroke: isActive ? "var(--accent-teal)" : "var(--muted-foreground)",
            strokeWidth: isActive ? 2 : 1.5,
            opacity: stage && !isActive ? 0.4 : 1,
          },
        };
      })
    );
  }, [selStage, stages, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (c) =>
      setEdges((eds) =>
        addEdge(
          {
            ...c,
            id: simId("edge"),
            markerEnd: { type: MarkerType.ArrowClosed, color: "var(--muted-foreground)" },
            style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  function addNode(kind: SimNodeKind) {
    const id = simId("node");
    const data: SimNodeData = {
      label: KIND_META[kind].label,
      kind,
      active: false,
      dimmed: Boolean(selStage),
    };
    setNodes((nds) =>
      nds.concat({
        id,
        type: "sim",
        position: { x: 100 + (nds.length % 4) * 60, y: 70 + (nds.length % 6) * 64 },
        data: data as unknown as Record<string, unknown>,
      })
    );
    setSelNode(id);
    setSelEdge(null);
  }

  function patchNode(id: string, patch: Partial<SimNodeData>) {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  }

  function removeNode(id: string) {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        activeNodeIds: s.activeNodeIds.filter((x) => x !== id),
      }))
    );
    setSelNode(null);
  }

  function patchEdge(id: string, patch: Partial<Edge>) {
    setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEdge(id: string) {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        activeEdgeIds: s.activeEdgeIds.filter((x) => x !== id),
      }))
    );
    setSelEdge(null);
  }

  function toggleInStage(kind: "node" | "edge", itemId: string) {
    if (!selStage) return;
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== selStage) return s;
        const key = kind === "node" ? "activeNodeIds" : "activeEdgeIds";
        const list = s[key];
        return {
          ...s,
          [key]: list.includes(itemId)
            ? list.filter((x) => x !== itemId)
            : [...list, itemId],
        };
      })
    );
  }

  // --- stages CRUD ---
  function addStage() {
    const s: SimStage = {
      id: simId("stage"),
      title: `Stage ${stages.length + 1}`,
      caption: "",
      activeNodeIds: [],
      activeEdgeIds: [],
    };
    setStages((prev) => [...prev, s]);
    setSelStage(s.id);
  }

  function patchStage(id: string, patch: Partial<SimStage>) {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStage(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id));
    if (selStage === id) setSelStage(null);
  }

  function moveStage(id: string, dir: "up" | "down") {
    setStages((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = dir === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function save() {
    const spec: SimulationSpec = {
      version: 1,
      title: initialSpec.title,
      nodes: nodes.map((n) => {
        const d = n.data as unknown as SimNodeData;
        return {
          id: n.id,
          label: d.label,
          kind: d.kind,
          position: n.position,
          description: d.description || undefined,
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: (e.label as string) || undefined,
        animated: e.animated || undefined,
      })),
      stages,
    };
    onSave(spec);
  }

  const selectedNode = selNode ? nodes.find((n) => n.id === selNode) : null;
  const selectedNodeData = selectedNode
    ? (selectedNode.data as unknown as SimNodeData)
    : null;
  const selectedEdge = selEdge ? edges.find((e) => e.id === selEdge) : null;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-subtle p-0.5">
          <TabBtn active={tab === "build"} onClick={() => setTab("build")}>
            <Workflow className="size-3.5" /> Build
          </TabBtn>
          <TabBtn active={tab === "stages"} onClick={() => setTab("stages")}>
            <Layers className="size-3.5" /> Stages
          </TabBtn>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Save simulation
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        {/* Left panel */}
        <aside className="w-52 shrink-0 overflow-y-auto rounded-lg border border-border bg-card p-2">
          {tab === "build" ? (
            <>
              <p className="px-1 pb-1.5 text-xs font-medium text-muted-foreground">
                Add a node
              </p>
              <div className="grid gap-1">
                {SIM_NODE_KINDS.map((kind) => {
                  const meta = KIND_META[kind];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => addNode(kind)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <Icon
                        className="size-4"
                        style={{ color: `var(${meta.accent})` }}
                      />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-1 pb-1.5">
                <p className="text-xs font-medium text-muted-foreground">Stages</p>
                <button
                  type="button"
                  onClick={addStage}
                  aria-label="Add stage"
                  className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {stages.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                  Add a stage to script guided playback.
                </p>
              ) : (
                <ul className="grid gap-1">
                  {stages.map((s, i) => (
                    <li
                      key={s.id}
                      className={cn(
                        "rounded-md border px-2 py-1.5",
                        selStage === s.id
                          ? "border-[var(--primary)] bg-muted/60"
                          : "border-border"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelStage(selStage === s.id ? null : s.id)}
                        className="flex w-full items-center gap-2 text-left text-sm"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded bg-muted text-[10px] text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="truncate">{s.title}</span>
                      </button>
                      <div className="mt-1 flex items-center gap-0.5">
                        <MiniBtn label="Up" onClick={() => moveStage(s.id, "up")} disabled={i === 0}>
                          <ChevronUp className="size-3.5" />
                        </MiniBtn>
                        <MiniBtn label="Down" onClick={() => moveStage(s.id, "down")} disabled={i === stages.length - 1}>
                          <ChevronDown className="size-3.5" />
                        </MiniBtn>
                        <MiniBtn label="Delete" onClick={() => removeStage(s.id)} destructive>
                          <Trash2 className="size-3.5" />
                        </MiniBtn>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>

        {/* Canvas */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            onNodeClick={(_, node) => {
              if (selStage) toggleInStage("node", node.id);
              else {
                setSelNode(node.id);
                setSelEdge(null);
              }
            }}
            onEdgeClick={(_, edge) => {
              if (selStage) toggleInStage("edge", edge.id);
              else {
                setSelEdge(edge.id);
                setSelNode(null);
              }
            }}
            onPaneClick={() => {
              setSelNode(null);
              setSelEdge(null);
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1}
              color="var(--border)"
            />
            <Controls showInteractive={false} />
          </ReactFlow>

          {selStage && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-[color-mix(in_srgb,var(--primary)_14%,var(--card))] px-3 py-1.5 text-center text-xs text-foreground">
              Editing “{stages.find((s) => s.id === selStage)?.title}” — click nodes
              and edges to toggle them in this stage.
            </div>
          )}
        </div>

        {/* Inspector */}
        <aside className="w-64 shrink-0 overflow-y-auto rounded-lg border border-border bg-card p-3">
          {tab === "stages" ? (
            selStage ? (
              <StageInspector
                stage={stages.find((s) => s.id === selStage)!}
                onPatch={(p) => patchStage(selStage, p)}
              />
            ) : (
              <Hint>Select or add a stage, then click nodes/edges to include them.</Hint>
            )
          ) : selectedNode && selectedNodeData ? (
            <div className="grid gap-3">
              <p className="text-sm font-medium">Node</p>
              <Field label="Label">
                <Input
                  value={selectedNodeData.label}
                  onChange={(e) => patchNode(selectedNode.id, { label: e.target.value })}
                />
              </Field>
              <Field label="Kind">
                <select
                  value={selectedNodeData.kind}
                  onChange={(e) =>
                    patchNode(selectedNode.id, { kind: e.target.value as SimNodeKind })
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {SIM_NODE_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {KIND_META[k].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <Textarea
                  value={selectedNodeData.description ?? ""}
                  onChange={(e) =>
                    patchNode(selectedNode.id, { description: e.target.value })
                  }
                  placeholder="Shown when a learner clicks this node."
                  rows={3}
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeNode(selectedNode.id)}
              >
                <Trash2 className="size-4" /> Delete node
              </Button>
            </div>
          ) : selectedEdge ? (
            <div className="grid gap-3">
              <p className="text-sm font-medium">Connection</p>
              <Field label="Label">
                <Input
                  value={(selectedEdge.label as string) ?? ""}
                  onChange={(e) => patchEdge(selectedEdge.id, { label: e.target.value })}
                  placeholder="e.g. request"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(selectedEdge.animated)}
                  onChange={(e) => patchEdge(selectedEdge.id, { animated: e.target.checked })}
                />
                Animate by default
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeEdge(selectedEdge.id)}
              >
                <Trash2 className="size-4" /> Delete connection
              </Button>
            </div>
          ) : (
            <Hint>
              Add nodes from the left, drag from a node&apos;s edge to connect them,
              and select a node or connection to edit it.
            </Hint>
          )}
        </aside>
      </div>
    </div>
  );
}

function StageInspector({
  stage,
  onPatch,
}: {
  stage: SimStage;
  onPatch: (p: Partial<SimStage>) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">Stage</p>
      <Field label="Title">
        <Input value={stage.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </Field>
      <Field label="Caption">
        <Textarea
          value={stage.caption}
          onChange={(e) => onPatch({ caption: e.target.value })}
          placeholder="What's happening at this stage?"
          rows={4}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        {stage.activeNodeIds.length} node(s), {stage.activeEdgeIds.length}{" "}
        connection(s) active. Click items on the canvas to toggle.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-sm transition-colors",
        active
          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MiniBtn({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none",
        destructive && "hover:!text-destructive"
      )}
    >
      {children}
    </button>
  );
}
