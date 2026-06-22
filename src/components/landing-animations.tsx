"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ================================================================
   ParallaxSection
   Wraps a section and reveals it on scroll. Uses native CSS
   scroll-driven animations when supported, falls back to
   IntersectionObserver for other browsers.
   ================================================================ */

export function ParallaxSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If native scroll-driven animations are supported, CSS handles it
    const supportsScrollDriven = CSS.supports(
      "(animation-timeline: view()) and (animation-range: entry)"
    );
    if (supportsScrollDriven) return;

    // Fallback: IntersectionObserver
    el.classList.add("reveal-hidden");
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "-40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

/* ================================================================
   FloatingCode
   A decorative code snippet that floats with a subtle bobbing
   animation. Pure decoration for the hero section.
   ================================================================ */

const CODE_LINES = [
  { text: "const", cls: "text-accent-teal" },
  { text: " lab", cls: "text-accent-purple" },
  { text: " = ", cls: "text-foreground/50" },
  { text: "await", cls: "text-accent-teal" },
  { text: " createLab", cls: "text-accent-orange" },
  { text: "({", cls: "text-foreground/50" },
];

const CODE_LINES_2 = [
  { text: "  title", cls: "text-accent-purple" },
  { text: ": ", cls: "text-foreground/50" },
  { text: '"Getting Started"', cls: "text-accent-pink" },
  { text: ",", cls: "text-foreground/50" },
];

const CODE_LINES_3 = [
  { text: "  steps", cls: "text-accent-purple" },
  { text: ": ", cls: "text-foreground/50" },
  { text: "12", cls: "text-accent-gold" },
  { text: ",", cls: "text-foreground/50" },
];

const CODE_LINES_4 = [
  { text: "  tags", cls: "text-accent-purple" },
  { text: ": [", cls: "text-foreground/50" },
  { text: '"react"', cls: "text-accent-pink" },
  { text: ", ", cls: "text-foreground/50" },
  { text: '"next.js"', cls: "text-accent-pink" },
  { text: "]", cls: "text-foreground/50" },
];

const CODE_LINES_5 = [
  { text: "});", cls: "text-foreground/50" },
];

function CodeLine({ tokens }: { tokens: { text: string; cls: string }[] }) {
  return (
    <div className="whitespace-pre font-mono text-[13px] leading-6">
      {tokens.map((t, i) => (
        <span key={i} className={t.cls}>
          {t.text}
        </span>
      ))}
    </div>
  );
}

export function FloatingCode() {
  return (
    <div className="animate-float pointer-events-none select-none" aria-hidden>
      <div className="relative rounded-xl border border-border/60 bg-[#141414] p-5 shadow-2xl shadow-black/40">
        {/* Window dots */}
        <div className="mb-3 flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E34671]/70" />
          <span className="size-2.5 rounded-full bg-[#F1B467]/70" />
          <span className="size-2.5 rounded-full bg-[#3FA266]/70" />
        </div>
        {/* Code */}
        <CodeLine tokens={CODE_LINES} />
        <CodeLine tokens={CODE_LINES_2} />
        <CodeLine tokens={CODE_LINES_3} />
        <CodeLine tokens={CODE_LINES_4} />
        <CodeLine tokens={CODE_LINES_5} />
        {/* Blinking cursor */}
        <div className="absolute bottom-5 left-[68px] h-4 w-[2px] animate-pulse bg-accent-teal/70" />
        {/* Glow behind the card */}
        <div className="animate-glow absolute -inset-[1px] -z-10 rounded-xl bg-gradient-to-br from-accent-teal/20 via-accent-purple/15 to-accent-pink/20 blur-xl" />
      </div>
    </div>
  );
}

/* ================================================================
   GlowCard
   A card with a mouse-tracking glow effect. On hover, a radial
   gradient follows the cursor, using theme accent colors.
   ================================================================ */

export function GlowCard({
  children,
  className = "",
  glowColor = "var(--accent-teal)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--glow-x", `${x}px`);
      el.style.setProperty("--glow-y", `${y}px`);
    };

    el.addEventListener("pointermove", handleMove);
    return () => el.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] hover:shadow-lg ${className}`}
    >
      {/* Mouse-tracking glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--glow-x, 50%) var(--glow-y, 50%), color-mix(in srgb, ${glowColor} 12%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ================================================================
   GradientText
   Renders children with an animated gradient background-clip.
   ================================================================ */

export function GradientText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`animate-gradient-text bg-gradient-to-r from-accent-teal via-accent-purple to-accent-pink bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}
