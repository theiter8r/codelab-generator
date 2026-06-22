import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  getCompletedLabs,
  getPublicActivityCalendar,
  getPublicProfile,
} from "@/lib/queries";
import { ContributionGraph } from "@/components/dashboard/contribution-graph";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  const name = profile?.display_name || "Learner";
  return { title: `${name}'s profile` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const [activity, completed] = await Promise.all([
    getPublicActivityCalendar(id),
    getCompletedLabs(id),
  ]);

  const name = profile.display_name || "Learner";
  const initial = name.charAt(0).toUpperCase();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-secondary text-xl font-semibold text-secondary-foreground">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Learning since {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Steps this year" value={activity.total} />
          <Stat label="Labs completed" value={completed.length} />
          <Stat label="Longest streak" value={`${activity.longestStreak}d`} />
        </div>

        {/* Contribution graph */}
        <div className="mt-6">
          <ContributionGraph data={activity} />
        </div>

        {/* Completed labs */}
        <h2 className="mt-8 text-sm font-semibold tracking-tight">
          Completed labs
        </h2>
        {completed.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No finished labs yet — the journey&apos;s just getting started.
          </p>
        ) : (
          <ul className="stagger mt-3 grid gap-2">
            {completed.map((lab, i) => (
              <li key={lab.id} style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/labs/${lab.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {lab.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(lab.completed_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
