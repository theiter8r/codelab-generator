import { z } from "zod";
import {
  Box,
  Circle,
  Database,
  Flag,
  GitBranch,
  Globe,
  HardDrive,
  ListOrdered,
  Play,
  Server,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * A simulation is nodes + edges + ordered stages — the shared primitive behind
 * both architecture diagrams and process/algorithm walkthroughs. The whole spec
 * is stored in a Tiptap node attribute (serialized into `lab_steps.content`), so
 * there is no separate table.
 */

export const SIM_NODE_KINDS = [
  "client",
  "api",
  "service",
  "database",
  "cache",
  "queue",
  "storage",
  "process",
  "decision",
  "start",
  "end",
  "generic",
] as const;

export type SimNodeKind = (typeof SIM_NODE_KINDS)[number];

export interface SimNode {
  id: string;
  label: string;
  kind: SimNodeKind;
  position: { x: number; y: number };
  description?: string;
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface SimStage {
  id: string;
  title: string;
  caption: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
}

export interface SimulationSpec {
  version: 1;
  title?: string;
  nodes: SimNode[];
  edges: SimEdge[];
  stages: SimStage[];
}

// --- zod schema (safe-parse on render so malformed specs never crash) --------

const simNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(SIM_NODE_KINDS),
  position: z.object({ x: z.number(), y: z.number() }),
  description: z.string().optional(),
});

const simEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  animated: z.boolean().optional(),
});

const simStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  caption: z.string(),
  activeNodeIds: z.array(z.string()),
  activeEdgeIds: z.array(z.string()),
});

export const simulationSpecSchema = z.object({
  version: z.literal(1),
  title: z.string().optional(),
  nodes: z.array(simNodeSchema),
  edges: z.array(simEdgeSchema),
  stages: z.array(simStageSchema),
});

export function createEmptySpec(): SimulationSpec {
  return { version: 1, nodes: [], edges: [], stages: [] };
}

/** Parse an unknown spec attribute, falling back to an empty diagram. */
export function parseSpec(raw: unknown): SimulationSpec {
  const result = simulationSpecSchema.safeParse(raw);
  return result.success ? result.data : createEmptySpec();
}

// --- presentation metadata per kind (icon + theme accent token) --------------

export interface KindMeta {
  label: string;
  icon: LucideIcon;
  /** CSS custom property carrying the kind's accent colour. */
  accent: string;
}

export const KIND_META: Record<SimNodeKind, KindMeta> = {
  client: { label: "Client", icon: Globe, accent: "--accent-teal" },
  api: { label: "API", icon: Webhook, accent: "--accent-purple" },
  service: { label: "Service", icon: Server, accent: "--accent-green" },
  database: { label: "Database", icon: Database, accent: "--accent-orange" },
  cache: { label: "Cache", icon: Zap, accent: "--accent-gold" },
  queue: { label: "Queue", icon: ListOrdered, accent: "--accent-pink" },
  storage: { label: "Storage", icon: HardDrive, accent: "--accent-orange" },
  process: { label: "Process", icon: Box, accent: "--accent-teal" },
  decision: { label: "Decision", icon: GitBranch, accent: "--accent-gold" },
  start: { label: "Start", icon: Play, accent: "--accent-green" },
  end: { label: "End", icon: Flag, accent: "--accent-pink" },
  generic: { label: "Node", icon: Circle, accent: "--muted-foreground" },
};

/** Short unique id for new nodes/edges/stages created in the builder. */
export function simId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
