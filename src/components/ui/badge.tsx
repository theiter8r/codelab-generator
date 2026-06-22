import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        success:
          "border-transparent bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]",
        warning:
          "border-transparent bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] text-[var(--warning)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
