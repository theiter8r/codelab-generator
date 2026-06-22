"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { setStepComplete } from "@/lib/actions/progress";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function MarkCompleteButton({
  labId,
  stepId,
  slug,
  initialCompleted,
  nextPosition,
  signedIn,
}: {
  labId: string;
  stepId: string;
  slug: string;
  initialCompleted: boolean;
  nextPosition: number | null;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Button asChild>
        <a href={`/login?redirect=/labs/${slug}/steps`}>Sign in to track progress</a>
      </Button>
    );
  }

  function complete() {
    setCompleted(true); // optimistic
    startTransition(async () => {
      await setStepComplete(labId, stepId, true, slug);
      if (nextPosition) {
        router.push(`/labs/${slug}/steps/${nextPosition}`);
      } else {
        router.refresh();
      }
    });
  }

  function undo() {
    setCompleted(false);
    startTransition(async () => {
      await setStepComplete(labId, stepId, false, slug);
      router.refresh();
    });
  }

  if (completed) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--success)]">
          <Check className="size-4" /> Completed
        </span>
        {nextPosition ? (
          <Button
            onClick={() =>
              router.push(`/labs/${slug}/steps/${nextPosition}`)
            }
          >
            Next step <ArrowRight className="size-4" />
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={undo} disabled={pending}>
          <RotateCcw className="size-3.5" /> Undo
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={complete} disabled={pending}>
      {pending ? <Spinner /> : <Check className="size-4" />}
      {nextPosition ? "Mark complete & continue" : "Mark complete"}
    </Button>
  );
}
