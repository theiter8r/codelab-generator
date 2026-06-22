import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[color-mix(in_srgb,var(--muted-foreground)_14%,transparent)]",
        className
      )}
      {...props}
    />
  );
}
