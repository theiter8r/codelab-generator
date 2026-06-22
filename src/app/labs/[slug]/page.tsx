import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, Clock, Layers } from "lucide-react";
import {
  getCompletions,
  getLabBySlug,
  getLabModules,
  getLabSteps,
  getProgress,
} from "@/lib/queries";
import { getUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HintsToggle } from "@/components/labs/hints-toggle";
import { groupStepsByModule, isDocEmpty } from "@/lib/utils";

const difficultyLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  return { title: lab?.title ?? "Lab", description: lab?.summary ?? undefined };
}

export default async function LabOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  const [steps, modules, user] = await Promise.all([
    getLabSteps(lab.id),
    getLabModules(lab.id),
    getUser(),
  ]);

  const completedIds = new Set<string>();
  let resumePosition = steps[0]?.position ?? 1;
  let hintsEnabled = true;
  if (user) {
    const [completions, progress] = await Promise.all([
      getCompletions(user.id, lab.id),
      getProgress(user.id, lab.id),
    ]);
    completions.forEach((c) => completedIds.add(c.step_id));
    hintsEnabled = progress?.hints_enabled ?? true;
    const firstIncomplete = steps.find((s) => !completedIds.has(s.id));
    resumePosition =
      firstIncomplete?.position ??
      progress?.current_step_position ??
      steps[0]?.position ??
      1;
  }

  const groups = groupStepsByModule(modules, steps);
  const globalNumber = new Map(steps.map((s, i) => [s.id, i + 1]));
  const labHasHints = steps.some((s) => !isDocEmpty(s.hint));
  const total = steps.length;
  const completed = completedIds.size;
  const pct = total ? (completed / total) * 100 : 0;
  const started = completed > 0;
  const done = total > 0 && completed === total;

  const ctaLabel = done ? "Review lab" : started ? "Resume" : "Start lab";
  const ctaHref = total
    ? `/labs/${lab.slug}/steps/${resumePosition}`
    : `/labs/${lab.slug}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        <Link
          href="/labs"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All labs
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{difficultyLabel[lab.difficulty]}</Badge>
          {lab.est_minutes ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {lab.est_minutes} min
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="size-3.5" /> {total} step{total === 1 ? "" : "s"}
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{lab.title}</h1>
        {lab.summary && (
          <p className="mt-2 text-muted-foreground">{lab.summary}</p>
        )}

        {lab.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lab.cover_image_url}
            alt=""
            className="mt-6 aspect-[16/9] w-full rounded-xl border border-border object-cover"
          />
        )}

        {user && started && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Your progress</span>
              <span className="text-muted-foreground">
                {completed}/{total} complete
              </span>
            </div>
            <Progress value={pct} />
          </div>
        )}

        <div className="mt-6">
          {total === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              This lab has no steps yet.
            </p>
          ) : (
            <Button asChild size="lg">
              <Link href={ctaHref}>
                {ctaLabel} <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {user && labHasHints && (
          <div className="mt-4 max-w-xs">
            <p className="mb-1.5 text-xs text-muted-foreground">
              Do this lab with or without hints:
            </p>
            <HintsToggle labId={lab.id} slug={lab.slug} enabled={hintsEnabled} />
          </div>
        )}

        {/* Step outline, grouped by module */}
        {total > 0 && (
          <div className="mt-8 grid gap-5">
            {groups.map((group) => (
              <div key={group.module?.id ?? "ungrouped"}>
                {group.module && (
                  <div className="mb-2">
                    <h2 className="text-sm font-semibold tracking-tight">
                      {group.module.title}
                    </h2>
                    {group.module.description && (
                      <p className="text-xs text-muted-foreground">
                        {group.module.description}
                      </p>
                    )}
                  </div>
                )}
                <ol className="grid gap-1.5">
                  {group.steps.map((step) => {
                    const isDone = completedIds.has(step.id);
                    return (
                      <li key={step.id}>
                        <Link
                          href={`/labs/${lab.slug}/steps/${step.position}`}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-muted/50"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-5 text-[var(--success)]" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {globalNumber.get(step.id)}
                          </span>
                          <span className="font-medium">{step.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
