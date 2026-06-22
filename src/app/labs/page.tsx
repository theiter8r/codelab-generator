import Link from "next/link";
import { Search } from "lucide-react";
import { getPublishedLabs, getPublishedTags } from "@/lib/queries";
import { LabCard } from "@/components/labs/lab-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const metadata = { title: "Labs" };

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const [labs, tags] = await Promise.all([
    getPublishedLabs({ q, tag }),
    getPublishedTags(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight">Labs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse hands-on coding labs and start learning.
        </p>

        <form action="/labs" className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search labs…"
            className="pl-9"
          />
          {tag && <input type="hidden" name="tag" value={tag} />}
        </form>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <TagChip href={buildHref(q, undefined)} active={!tag}>
              All
            </TagChip>
            {tags.map((t) => (
              <TagChip key={t} href={buildHref(q, t)} active={tag === t}>
                {t}
              </TagChip>
            ))}
          </div>
        )}
      </div>

      {labs.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No labs match your search.
        </p>
      ) : (
        <div className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab, i) => (
            <div key={lab.id} style={{ "--i": i } as React.CSSProperties}>
              <LabCard lab={lab} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function buildHref(q?: string, tag?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/labs?${qs}` : "/labs";
}

function TagChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ease-[var(--ease-out)]",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
