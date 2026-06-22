"use client";

import { useState, useTransition } from "react";
import { Lightbulb } from "lucide-react";
import { setHintsEnabled } from "@/lib/actions/progress";
import { cn } from "@/lib/utils";

/**
 * Per-lab "with hints / without hints" switch. Persists to the learner's
 * progress so the choice sticks across steps and sessions.
 */
export function HintsToggle({
  labId,
  slug,
  enabled,
}: {
  labId: string;
  slug: string;
  enabled: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      await setHintsEnabled(labId, next, slug);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-sm transition-colors duration-150 ease-[var(--ease-out)] hover:bg-muted/60 active:scale-[0.99] disabled:opacity-60",
        on ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Lightbulb
        className={cn("size-4", on ? "text-[var(--warning)]" : "opacity-60")}
      />
      <span className="font-medium">Hints {on ? "on" : "off"}</span>
      <span
        className={cn(
          "relative ml-auto h-4 w-7 rounded-full transition-colors duration-200 ease-[var(--ease-out)]",
          on ? "bg-[var(--warning)]" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-out)]",
            on ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
