"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import type { SimStage } from "@/lib/simulation/types";
import { cn } from "@/lib/utils";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/** Guided playback: Play/Prev/Next/scrubber + the current stage's caption. */
export function StageController({
  stages,
  index,
  onIndex,
}: {
  stages: SimStage[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const count = stages.length;
  const reduce = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);

  const go = useCallback(
    (i: number) => onIndex(Math.max(0, Math.min(count - 1, i))),
    [count, onIndex]
  );

  // Autoplay advances one stage every 2.5s; stops at the end.
  useEffect(() => {
    if (!playing || reduce) return;
    if (index >= count - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => go(index + 1), 2500);
    return () => clearTimeout(t);
  }, [playing, reduce, index, count, go]);

  // Arrow keys step through stages.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const stage = stages[Math.min(index, count - 1)];
  const atEnd = index >= count - 1;

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <IconBtn label="Previous" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft className="size-4" />
        </IconBtn>

        {!reduce && (
          <IconBtn
            label={playing ? "Pause" : "Play"}
            onClick={() => {
              if (atEnd) {
                go(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            accent
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </IconBtn>
        )}

        <IconBtn label="Next" onClick={() => go(index + 1)} disabled={atEnd}>
          <ChevronRight className="size-4" />
        </IconBtn>

        <input
          type="range"
          min={0}
          max={count - 1}
          value={Math.min(index, count - 1)}
          aria-label="Stage"
          onChange={(e) => {
            setPlaying(false);
            go(Number(e.target.value));
          }}
          className="h-1.5 flex-1 cursor-pointer accent-[var(--primary)]"
        />

        <span className="tabular-nums text-xs text-muted-foreground">
          {Math.min(index, count - 1) + 1}/{count}
        </span>

        <IconBtn
          label="Restart"
          onClick={() => {
            setPlaying(false);
            go(0);
          }}
        >
          <RotateCcw className="size-3.5" />
        </IconBtn>
      </div>

      <div className="mt-2.5">
        <p className="text-sm font-medium">{stage.title}</p>
        {stage.caption && (
          <p className="mt-0.5 text-sm text-muted-foreground">{stage.caption}</p>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
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
        "grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none",
        accent
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
