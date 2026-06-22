import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  PenLine,
  BarChart3,
  ShieldCheck,
  Tag,
  Palette,
  Zap,
  ChevronRight,
  Terminal,
  Database,
  Code2,
  Layers,
} from "lucide-react";
import { getPublishedLabs } from "@/lib/queries";
import { getUser } from "@/lib/auth";
import { LabCard } from "@/components/labs/lab-card";
import { Button } from "@/components/ui/button";
import {
  ParallaxSection,
  FloatingCode,
  GlowCard,
  GradientText,
} from "@/components/landing-animations";

const FEATURES = [
  {
    icon: PenLine,
    title: "Rich WYSIWYG Editor",
    description:
      "Author labs with Tiptap — a powerful block editor with syntax-highlighted code blocks, images, and rich formatting. No markdown needed.",
    glow: "var(--accent-orange)",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Learners mark steps complete as they go. Resume exactly where you left off, with a personal dashboard showing all active labs.",
    glow: "var(--accent-teal)",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Postgres Row Level Security ensures only admins can author. Each learner's progress is private and isolated by default.",
    glow: "var(--accent-green)",
  },
  {
    icon: Tag,
    title: "Tags & Search",
    description:
      "Organize labs with tags and let learners filter the catalog by topic. Full-text search across all published lab titles.",
    glow: "var(--accent-purple)",
  },
  {
    icon: Palette,
    title: "Light & Dark Themes",
    description:
      "Cursor-inspired color palette with system-aware theme switching. Every surface, border, and accent adapts beautifully.",
    glow: "var(--accent-pink)",
  },
  {
    icon: Zap,
    title: "Server Components",
    description:
      "Built on Next.js 16 App Router with React Server Components. Pages load fast with zero client-side JS unless needed.",
    glow: "var(--accent-gold)",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Author Creates Labs",
    description:
      "Write step-by-step labs in a rich editor. Add code blocks, images, and templates. Publish when ready.",
    icon: PenLine,
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
    border: "border-accent-orange/20",
  },
  {
    number: "02",
    title: "Learners Browse & Start",
    description:
      "Browse the catalog by tags or search. Sign up with email, GitHub, or Google OAuth. Start any published lab.",
    icon: Layers,
    color: "text-accent-teal",
    bg: "bg-accent-teal/10",
    border: "border-accent-teal/20",
  },
  {
    number: "03",
    title: "Track Progress",
    description:
      "Mark steps complete as you go. See your progress dashboard. Pick up exactly where you left off, anytime.",
    icon: BarChart3,
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    border: "border-accent-purple/20",
  },
];

const TECH_STACK = [
  {
    name: "Next.js 16",
    description: "App Router, Server Components, Server Actions",
    icon: Code2,
    glow: "var(--accent-teal)",
  },
  {
    name: "Supabase",
    description: "Postgres, Auth (OAuth), Row Level Security, Storage",
    icon: Database,
    glow: "var(--accent-green)",
  },
  {
    name: "Tiptap Editor",
    description: "Block-based WYSIWYG with syntax-highlighted code blocks",
    icon: PenLine,
    glow: "var(--accent-orange)",
  },
  {
    name: "Tailwind CSS v4",
    description: "Utility-first CSS with custom Cursor-inspired design tokens",
    icon: Palette,
    glow: "var(--accent-pink)",
  },
];

export default async function HomePage() {
  const [labs, user] = await Promise.all([getPublishedLabs(), getUser()]);
  const featured = labs.slice(0, 6);

  return (
    <main className="overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════
          HERO
         ════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Background glow orbs */}
        <div
          className="animate-glow pointer-events-none absolute -top-24 left-1/2 -z-10 h-[480px] w-[700px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse, var(--accent-teal) 0%, var(--accent-purple) 40%, transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="animate-glow pointer-events-none absolute -top-10 right-[10%] -z-10 h-[300px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, var(--accent-pink) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
          aria-hidden
        />

        <div className="animate-fade-up grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1fr,auto] lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-subtle px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" /> Hands-on, step-by-step coding
              labs
            </span>

            <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
              Learn by building,{" "}
              <GradientText>one step at a time.</GradientText>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0">
              Work through guided coding labs at your own pace. Track your
              progress and pick up exactly where you left off.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <Link href="/labs">
                  Browse labs <ArrowRight className="size-4" />
                </Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Decorative floating code snippet */}
          <div className="hidden lg:block">
            <FloatingCode />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHAT IS CODELABS?
         ════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/50 bg-subtle/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <ParallaxSection>
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-3 inline-block rounded-full border border-accent-teal/20 bg-accent-teal/10 px-3 py-1 text-xs font-medium text-accent-teal">
                About the project
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What is <GradientText>CodeLabs</GradientText>?
              </h2>
              <p className="mt-5 text-balance text-lg leading-relaxed text-muted-foreground">
                CodeLabs is a platform for creating and consuming step-by-step
                coding tutorials. As an <strong className="text-foreground">author</strong>, you
                write labs in a rich WYSIWYG editor — adding code blocks with
                syntax highlighting, images, and reusable templates. As a{" "}
                <strong className="text-foreground">learner</strong>, you sign up, browse the
                catalog, and work through labs at your own pace with per-step
                progress tracking and instant resume.
              </p>
              <p className="mt-4 text-balance text-muted-foreground">
                Built with <strong className="text-foreground">Next.js 16</strong> (App Router &
                Server Components) and{" "}
                <strong className="text-foreground">Supabase</strong> (Postgres with Row Level
                Security, OAuth, and Storage). The entire UI uses a
                Cursor-inspired color system with smooth light/dark theme
                switching.
              </p>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES GRID
         ════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <ParallaxSection>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-3 text-muted-foreground">
              A focused set of features for authoring great labs and learning
              from them.
            </p>
          </div>
        </ParallaxSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <ParallaxSection key={f.title} delay={i * 60}>
              <GlowCard glowColor={f.glow} className="h-full">
                <div className="p-6">
                  <div className="mb-4 inline-flex rounded-lg border border-border bg-muted/50 p-2.5">
                    <f.icon className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </GlowCard>
            </ParallaxSection>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
         ════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/50 bg-subtle/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <ParallaxSection>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-muted-foreground">
                From authoring to learning — in three simple steps.
              </p>
            </div>
          </ParallaxSection>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <ParallaxSection key={step.number} delay={i * 80}>
                <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                  {/* Step number */}
                  <span
                    className={`mb-4 text-5xl font-black tracking-tighter ${step.color} opacity-20`}
                  >
                    {step.number}
                  </span>

                  {/* Icon circle */}
                  <div
                    className={`mb-4 inline-flex rounded-xl border ${step.border} ${step.bg} p-3`}
                  >
                    <step.icon className={`size-6 ${step.color}`} />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Arrow connector (visible on md+, not on last) */}
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/3 hidden size-6 text-border md:block" />
                  )}
                </div>
              </ParallaxSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TECH STACK
         ════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <ParallaxSection>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with modern tools
            </h2>
            <p className="mt-3 text-muted-foreground">
              A clean, production-ready stack you can learn from and extend.
            </p>
          </div>
        </ParallaxSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map((tech, i) => (
            <ParallaxSection key={tech.name} delay={i * 60}>
              <GlowCard glowColor={tech.glow} className="h-full">
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 inline-flex rounded-xl border border-border bg-muted/50 p-3">
                    <tech.icon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold tracking-tight">{tech.name}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {tech.description}
                  </p>
                </div>
              </GlowCard>
            </ParallaxSection>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED LABS
         ════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/50 bg-subtle/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <ParallaxSection>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {featured.length ? "Latest labs" : "No labs published yet"}
                </h2>
                {featured.length > 0 && (
                  <p className="mt-2 text-muted-foreground">
                    Start learning — pick a lab and dive in.
                  </p>
                )}
              </div>
              {labs.length > 6 && (
                <Link
                  href="/labs"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </ParallaxSection>

          {featured.length === 0 ? (
            <ParallaxSection>
              <div className="rounded-xl border border-dashed border-border py-20 text-center">
                <Terminal className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Check back soon — new labs are on the way.
                </p>
              </div>
            </ParallaxSection>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((lab, i) => (
                <ParallaxSection key={lab.id} delay={i * 60}>
                  <LabCard lab={lab} />
                </ParallaxSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FOOTER
         ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-teal) 8%, var(--background)), color-mix(in srgb, var(--accent-purple) 8%, var(--background)), color-mix(in srgb, var(--accent-pink) 6%, var(--background)))",
          }}
          aria-hidden
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <ParallaxSection>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to start learning?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Browse the lab catalog and start building real projects with
                guided, step-by-step tutorials.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/labs">
                    Explore labs <ArrowRight className="size-4" />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Create an account</Link>
                  </Button>
                )}
              </div>
            </div>
          </ParallaxSection>
        </div>
      </section>
    </main>
  );
}
