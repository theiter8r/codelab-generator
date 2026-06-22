import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LabModule, LabStep, TiptapDoc } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a URL-safe slug from a title. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Format an ISO timestamp as a short, locale-friendly date. */
export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** True when a Tiptap doc has no meaningful content (empty / blank paragraphs). */
export function isDocEmpty(doc: TiptapDoc | null | undefined): boolean {
  if (!doc || !doc.content || doc.content.length === 0) return true;
  return !doc.content.some((node) =>
    node.type === "paragraph"
      ? Array.isArray(node.content) && node.content.length > 0
      : true
  );
}

export type StepGroup = { module: LabModule | null; steps: LabStep[] };

/**
 * Group lab steps under their modules (in module order), with any unassigned
 * steps collected into a trailing `module: null` group. Steps keep their
 * incoming (global position) order within each group.
 */
export function groupStepsByModule(
  modules: LabModule[],
  steps: LabStep[]
): StepGroup[] {
  const byModule = new Map<string, LabStep[]>();
  const ungrouped: LabStep[] = [];
  for (const step of steps) {
    if (step.module_id) {
      const arr = byModule.get(step.module_id) ?? [];
      arr.push(step);
      byModule.set(step.module_id, arr);
    } else {
      ungrouped.push(step);
    }
  }

  const groups: StepGroup[] = [];
  for (const m of modules) {
    const ss = byModule.get(m.id);
    if (ss?.length) groups.push({ module: m, steps: ss });
  }
  if (ungrouped.length) groups.push({ module: null, steps: ungrouped });
  return groups;
}
