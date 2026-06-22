import { Flame, Trophy } from "lucide-react";
import type { ActivityCalendar } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

const DAY_MS = 86_400_000;
const WEEKS = 53;

// Five intensity steps, GitHub-style. Driven by --success so both themes work.
const LEVEL_BG = [
  "color-mix(in srgb, var(--muted-foreground) 14%, transparent)",
  "color-mix(in srgb, var(--success) 30%, transparent)",
  "color-mix(in srgb, var(--success) 50%, transparent)",
  "color-mix(in srgb, var(--success) 75%, transparent)",
  "var(--success)",
];

const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function level(count: number) {
  if (count <= 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

/**
 * GitHub-style contribution heatmap of a learner's step completions. Pure
 * render from precomputed counts; tooltips use the native `title` attribute so
 * it works without client JS.
 */
export function ContributionGraph({ data }: { data: ActivityCalendar }) {
  const { counts, total, currentStreak, longestStreak } = data;

  const now = new Date();
  const todayMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const dow = new Date(todayMs).getUTCDay(); // 0 = Sunday
  const startMs = todayMs - (dow + (WEEKS - 1) * 7) * DAY_MS;

  type Cell = { ms: number; key: string; count: number; future: boolean };
  const weeks: Cell[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const ms = startMs + (w * 7 + d) * DAY_MS;
      const key = new Date(ms).toISOString().slice(0, 10);
      const future = ms > todayMs;
      col.push({ ms, key, count: future ? 0 : counts[key] ?? 0, future });
    }
    weeks.push(col);
  }

  // One month label per column, shown when the month changes.
  let lastMonth = "";
  const monthLabels = weeks.map((col) => {
    const m = new Date(col[0].ms).toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    if (m !== lastMonth) {
      lastMonth = m;
      return m;
    }
    return "";
  });

  return (
    <section className="animate-fade-up rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold tracking-tight">Learning activity</h2>
        <p className="text-xs text-muted-foreground">
          {total} step{total === 1 ? "" : "s"} completed in the last year
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="size-3.5 text-[var(--warning)]" />
          {currentStreak}-day current streak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="size-3.5 text-[var(--success)]" />
          {longestStreak}-day longest streak
        </span>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          <div className="flex gap-1 pl-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="w-3 shrink-0 text-[10px] leading-none text-muted-foreground"
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="flex w-7 shrink-0 flex-col gap-1">
              {WEEKDAYS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-3 items-center text-[9px] leading-none text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((col, wi) => (
              <div key={wi} className="flex shrink-0 flex-col gap-1">
                {col.map((cell) =>
                  cell.future ? (
                    <div key={cell.key} className="size-3" />
                  ) : (
                    <div
                      key={cell.key}
                      title={`${cell.count} completion${
                        cell.count === 1 ? "" : "s"
                      } on ${formatDate(cell.key)}`}
                      className="size-3 rounded-sm ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.04]"
                      style={{ backgroundColor: LEVEL_BG[level(cell.count)] }}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {LEVEL_BG.map((bg, i) => (
          <span
            key={i}
            className="size-3 rounded-sm ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.04]"
            style={{ backgroundColor: bg }}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
