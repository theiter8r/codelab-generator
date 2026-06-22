"use client";

import { useState, useTransition } from "react";
import { Globe, Lock } from "lucide-react";
import { setLabPublished } from "@/lib/actions/labs";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function PublishToggle({
  labId,
  published,
  canPublish,
}: {
  labId: string;
  published: boolean;
  canPublish: boolean;
}) {
  const [isPublished, setIsPublished] = useState(published);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isPublished;
    setIsPublished(next); // optimistic
    startTransition(async () => {
      await setLabPublished(labId, next);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {isPublished ? "Published" : "Draft"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isPublished
            ? "Visible to everyone in the catalog."
            : canPublish
              ? "Only you can see this lab."
              : "Add at least one step before publishing."}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending || (!isPublished && !canPublish)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
          isPublished
            ? "border-border hover:bg-muted"
            : "border-transparent bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_90%,black)]"
        )}
      >
        {pending ? (
          <Spinner />
        ) : isPublished ? (
          <Lock className="size-4" />
        ) : (
          <Globe className="size-4" />
        )}
        {isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
