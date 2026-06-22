"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/actions/templates";
import { RichEditor } from "@/components/editor/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { TiptapDoc } from "@/lib/types";

export function TemplateEditor({
  templateId,
  initialName,
  initialDescription,
  initialContent,
}: {
  templateId?: string;
  initialName?: string;
  initialDescription?: string;
  initialContent?: TiptapDoc | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const docRef = useRef<TiptapDoc | null>(initialContent ?? null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        description,
        content: docRef.current ?? { type: "doc", content: [] },
      };
      const res = templateId
        ? await updateTemplate(templateId, payload)
        : await createTemplate(payload);

      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (!templateId) {
        router.push(`/admin/templates/${res.id}/edit`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="tpl-name">Template name</Label>
        <Input
          id="tpl-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Prerequisites & setup"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tpl-desc">Description</Label>
        <Textarea
          id="tpl-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — what this block is for, shown in the picker."
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Content</Label>
        <RichEditor
          initialContent={initialContent ?? null}
          onChange={(doc) => {
            docRef.current = doc;
          }}
        />
      </div>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>
          {pending && <Spinner />}
          {templateId ? "Save template" : "Create template"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--success)]">
            <Check className="size-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}

        {templateId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:bg-destructive/10"
            disabled={deleting}
            onClick={() => {
              if (!confirm("Delete this template? This cannot be undone.")) return;
              startDelete(async () => {
                await deleteTemplate(templateId);
              });
            }}
          >
            {deleting ? <Spinner /> : <Trash2 className="size-4" />}
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
