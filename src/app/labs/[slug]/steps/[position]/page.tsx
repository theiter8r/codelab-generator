import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import {
  getCompletions,
  getLabBySlug,
  getLabModules,
  getLabSteps,
  getProgress,
} from "@/lib/queries";
import { getUser } from "@/lib/auth";
import { ContentViewer } from "@/components/editor/content-viewer";
import { ProgressTracker } from "@/components/labs/progress-tracker";
import { MarkCompleteButton } from "@/components/labs/mark-complete-button";
import { HintPanel } from "@/components/labs/hint-panel";
import { HintsToggle } from "@/components/labs/hints-toggle";
import { Progress } from "@/components/ui/progress";
import { cn, groupStepsByModule, isDocEmpty } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; position: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  return { title: lab ? `${lab.title} · steps` : "Step" };
}

export default async function StepViewerPage({
  params,
}: {
  params: Promise<{ slug: string; position: string }>;
}) {
  const { slug, position } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  const [steps, modules, user] = await Promise.all([
    getLabSteps(lab.id),
    getLabModules(lab.id),
    getUser(),
  ]);

  const pos = Number(position);
  const index = steps.findIndex((s) => s.position === pos);
  if (index === -1) notFound();

  const current = steps[index];
  const prev = steps[index - 1] ?? null;
  const next = steps[index + 1] ?? null;

  const completedIds = new Set<string>();
  let hintsEnabled = true;
  if (user) {
    const [completions, progress] = await Promise.all([
      getCompletions(user.id, lab.id),
      getProgress(user.id, lab.id),
    ]);
    completions.forEach((c) => completedIds.add(c.step_id));
    hintsEnabled = progress?.hints_enabled ?? true;
  }

  const total = steps.length;
  const completed = completedIds.size;
  const pct = total ? (completed / total) * 100 : 0;

  const groups = groupStepsByModule(modules, steps);
  const globalNumber = new Map(steps.map((s, i) => [s.id, i + 1]));
  const labHasHints = steps.some((s) => !isDocEmpty(s.hint));
  const showHint = hintsEnabled && !isDocEmpty(current.hint);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {user && <ProgressTracker labId={lab.id} position={current.position} />}

      <Link
        href={`/labs/${lab.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {lab.title}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-20">
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {completed}/{total}
                </span>
              </div>
              <Progress value={pct} />
            </div>

            {user && labHasHints && (
              <div className="mb-3">
                <HintsToggle
                  labId={lab.id}
                  slug={lab.slug}
                  enabled={hintsEnabled}
                />
              </div>
            )}

            <nav className="grid gap-2">
              {groups.map((group) => (
                <div key={group.module?.id ?? "ungrouped"} className="grid gap-0.5">
                  {group.module && (
                    <p className="px-2.5 pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.module.title}
                    </p>
                  )}
                  {group.steps.map((s) => {
                    const isCurrent = s.position === current.position;
                    const isDone = completedIds.has(s.id);
                    return (
                      <Link
                        key={s.id}
                        href={`/labs/${lab.slug}/steps/${s.position}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                          isCurrent
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />
                        ) : (
                          <Circle className="size-4 shrink-0 opacity-60" />
                        )}
                        <span className="truncate">
                          {globalNumber.get(s.id)}. {s.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="order-1 min-w-0 lg:order-2">
          <p className="text-sm text-muted-foreground">
            Step {index + 1} of {total}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {current.title}
          </h1>

          <div className="mt-6">
            <ContentViewer content={current.content} />
          </div>

          {showHint && current.hint && <HintPanel content={current.hint} />}

          {/* Footer nav */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              {prev ? (
                <Link
                  href={`/labs/${lab.slug}/steps/${prev.position}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" /> Previous
                </Link>
              ) : (
                <span />
              )}
            </div>
            <MarkCompleteButton
              labId={lab.id}
              stepId={current.id}
              slug={lab.slug}
              initialCompleted={completedIds.has(current.id)}
              nextPosition={next?.position ?? null}
              signedIn={Boolean(user)}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
