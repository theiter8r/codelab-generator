"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { ContentViewer } from "@/components/editor/content-viewer";
import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/lib/types";

/** Collapsible hint shown under a step when the learner has hints enabled. */
export function HintPanel({ content }: { content: TiptapDoc }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--warning)_45%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]"
      >
        <Lightbulb className="size-4 text-[var(--warning)]" />
        {open ? "Hide hint" : "Show hint"}
        <ChevronDown
          className={cn(
            "ml-auto size-4 text-muted-foreground transition-transform duration-200 ease-[var(--ease-out)]",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="animate-fade-up border-t border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] px-4 py-3">
          <ContentViewer content={content} />
        </div>
      )}
    </div>
  );
}
