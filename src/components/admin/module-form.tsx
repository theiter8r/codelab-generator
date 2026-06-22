"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateModule } from "@/lib/actions/labs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Inline title/description editor for a single module. */
export function ModuleForm({
  moduleId,
  labId,
  initialTitle,
  initialDescription,
}: {
  moduleId: string;
  labId: string;
  initialTitle: string;
  initialDescription: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateModule(moduleId, labId, { title, description });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="grid flex-1 gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Module title"
        className="font-medium"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description"
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={save} disabled={pending}>
          {pending ? <Spinner /> : null}
          Save module
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-[var(--success)]">
            <Check className="size-3.5" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
