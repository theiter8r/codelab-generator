"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const;

/**
 * Segmented light/system/dark switch. Theme changes are infrequent, so the
 * thumb gets a short ease-out slide; icons cross-fade with the active pill.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Gate on mount to avoid a hydration mismatch on the active pill.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: render an inert shell until mounted.
  const active = mounted ? theme ?? "system" : "system";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative inline-flex items-center gap-0.5 rounded-full border border-border bg-subtle p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "relative grid size-7 place-items-center rounded-full transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-border" />
            )}
            <Icon className="relative size-3.5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
