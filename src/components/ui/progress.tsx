import { cn } from "@/lib/utils";

/**
 * Determinate progress bar. The fill animates width with a strong ease-out so
 * jumps in completion feel responsive rather than crawling.
 */
export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-out)]",
          barClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
