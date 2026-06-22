import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getActivityCalendar, getDashboard } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ContributionGraph } from "@/components/dashboard/contribution-graph";

export const metadata = { title: "My progress" };

export default async function DashboardPage() {
  const user = await requireUser("/login?redirect=/dashboard");
  const [items, activity] = await Promise.all([
    getDashboard(user.id),
    getActivityCalendar(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight">My progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off.
        </p>

        <div className="mt-6">
          <ContributionGraph data={activity} />
        </div>

        {items.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
            <Compass className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">You haven&apos;t started any labs</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the catalog and begin your first lab.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/labs">
                Browse labs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="stagger mt-6 grid gap-3">
            {items.map(({ lab, completed, total }, i) => {
              const pct = total ? (completed / total) * 100 : 0;
              const done = total > 0 && completed === total;
              return (
                <li key={lab.id} style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={`/labs/${lab.slug}`}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lab.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {completed}/{total} steps complete
                        </p>
                      </div>
                      {done && <Badge variant="success">Done</Badge>}
                    </div>
                    <Progress value={pct} className="mt-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
