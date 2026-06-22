"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/labs";
import type { Difficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

type Defaults = {
  title?: string;
  summary?: string | null;
  difficulty?: Difficulty;
  est_minutes?: number | null;
  tags?: string[];
  cover_image_url?: string | null;
};

export function LabMetaForm({
  action,
  defaults,
  submitLabel,
  successLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Defaults;
  submitLabel: string;
  successLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const saved = !pending && state !== null && !state.error;

  return (
    <form action={formAction} className="grid gap-5">
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="Build a REST API with Next.js"
        />
      </Field>

      <Field label="Summary" htmlFor="summary" hint="One or two sentences shown on the catalog card.">
        <Textarea
          id="summary"
          name="summary"
          defaultValue={defaults?.summary ?? ""}
          placeholder="What will learners build and learn?"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Difficulty" htmlFor="difficulty">
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={defaults?.difficulty ?? "beginner"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>

        <Field label="Estimated minutes" htmlFor="est_minutes">
          <Input
            id="est_minutes"
            name="est_minutes"
            type="number"
            min={0}
            defaultValue={defaults?.est_minutes ?? ""}
            placeholder="30"
          />
        </Field>
      </div>

      <Field label="Tags" htmlFor="tags" hint="Comma-separated, e.g. nextjs, api, supabase">
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(", ")}
          placeholder="nextjs, supabase"
        />
      </Field>

      <Field label="Cover image URL" htmlFor="cover_image_url" hint="Optional. Paste a public image URL.">
        <Input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          defaultValue={defaults?.cover_image_url ?? ""}
          placeholder="https://…"
        />
      </Field>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
        {successLabel && saved && (
          <span className="text-sm text-[var(--success)]">{successLabel}</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
