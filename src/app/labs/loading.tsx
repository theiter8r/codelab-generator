import { Skeleton } from "@/components/ui/skeleton";

export default function LabsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-3 h-4 w-64" />
      <Skeleton className="mt-6 h-9 w-full max-w-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="grid gap-2 p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
