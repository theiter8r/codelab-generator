"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLab } from "@/lib/actions/labs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DeleteLabButton({ labId }: { labId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this lab and all its steps? This cannot be undone."))
          return;
        startTransition(async () => {
          await deleteLab(labId);
        });
      }}
    >
      {pending ? <Spinner /> : <Trash2 className="size-4" />}
      Delete lab
    </Button>
  );
}
