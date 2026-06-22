"use client";

import { useEffect } from "react";
import { touchProgress } from "@/lib/actions/progress";

/** Fire-and-forget: records that the learner viewed this step. */
export function ProgressTracker({
  labId,
  position,
}: {
  labId: string;
  position: number;
}) {
  useEffect(() => {
    void touchProgress(labId, position);
  }, [labId, position]);
  return null;
}
