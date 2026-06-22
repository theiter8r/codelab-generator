import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fast spin (0.6s) — a quicker spinner makes loading feel faster. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("size-4 animate-spin [animation-duration:0.6s]", className)}
      aria-hidden
    />
  );
}
