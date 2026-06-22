"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Check, Lightbulb } from "lucide-react";
import { updateStep } from "@/lib/actions/labs";
import { RichEditor } from "@/components/editor/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { TiptapDoc } from "@/lib/types";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [] };
const AUTOSAVE_MS = 1200;

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
  const titleRef = useRef(initialTitle);
  const docRef = useRef<TiptapDoc | null>(initialContent);
  const hintRef = useRef<TiptapDoc | null>(initialHint);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await updateStep(stepId, labId, {
        title: titleRef.current,
        content: docRef.current ?? EMPTY_DOC,
        hint: hintRef.current ?? EMPTY_DOC,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }, [stepId, labId]);

  // Debounced autosave: any edit (title, content, hint, or a saved simulation)
  // persists on its own, so there is no separate "commit the simulation" step.
  const scheduleSave = useCallback(() => {
    setDirty(true);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(), AUTOSAVE_MS);
  }, [save]);

  // Flush a pending autosave on unmount so navigating away never drops an edit.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="step-title">Step title</Label>
        <Input
          id="step-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            titleRef.current = e.target.value;
            scheduleSave();
          }}
          placeholder="e.g. Set up the project"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Step content</Label>
        <RichEditor
          initialContent={initialContent}
          onChange={(doc) => {
            docRef.current = doc;
            scheduleSave();
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
            scheduleSave();
          }}
        />
      </div>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>
          {pending && <Spinner />}
          Save step
        </Button>
        {pending ? (
          <span className="text-sm text-muted-foreground">Saving…</span>
        ) : saved ? (
          <span className="flex items-center gap-1 text-sm text-[var(--success)]">
            <Check className="size-4" /> Saved
          </span>
        ) : dirty ? (
          <span className="text-sm text-muted-foreground">Unsaved changes…</span>
        ) : null}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
