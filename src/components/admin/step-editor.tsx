"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Lightbulb } from "lucide-react";
import { updateStep } from "@/lib/actions/labs";
import { RichEditor } from "@/components/editor/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { TiptapDoc } from "@/lib/types";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [] };

export function StepEditor({
  stepId,
  labId,
  initialTitle,
  initialContent,
  initialHint,
}: {
  stepId: string;
  labId: string;
  initialTitle: string;
  initialContent: TiptapDoc | null;
  initialHint: TiptapDoc | null;
}) {
  const [title, setTitle] = useState(initialTitle);
  const docRef = useRef<TiptapDoc | null>(initialContent);
  const hintRef = useRef<TiptapDoc | null>(initialHint);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await updateStep(stepId, labId, {
        title,
        content: docRef.current ?? EMPTY_DOC,
        hint: hintRef.current ?? EMPTY_DOC,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="step-title">Step title</Label>
        <Input
          id="step-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Set up the project"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Step content</Label>
        <RichEditor
          initialContent={initialContent}
          onChange={(doc) => {
            docRef.current = doc;
          }}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="flex items-center gap-1.5">
          <Lightbulb className="size-4 text-[var(--warning)]" />
          Hint (optional)
        </Label>
        <p className="text-xs text-muted-foreground">
          Shown only to learners who choose to do this lab with hints. Leave
          blank for no hint.
        </p>
        <RichEditor
          initialContent={initialHint}
          onChange={(doc) => {
            hintRef.current = doc;
          }}
        />
      </div>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>
          {pending && <Spinner />}
          Save step
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--success)]">
            <Check className="size-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
