import Link from "next/link";
import { Clock, Layers } from "lucide-react";
import type { Lab } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const difficultyLabel: Record<Lab["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,border-color,box-shadow] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {lab.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lab.cover_image_url}
            alt=""
            className="size-full object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <Layers className="size-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{difficultyLabel[lab.difficulty]}</Badge>
          {lab.est_minutes ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {lab.est_minutes} min
            </span>
          ) : null}
        </div>
        <h3 className="font-semibold leading-snug tracking-tight">{lab.title}</h3>
        {lab.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{lab.summary}</p>
        )}
        {lab.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {lab.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
