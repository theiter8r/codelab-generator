"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import type { StepTemplate } from "@/lib/types";

/**
 * Browse saved step templates and insert one at the cursor. Templates are
 * admin-only (RLS), and this editor only renders for the admin, so a direct
 * client query is safe.
 */
export function TemplatePicker({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (content: StepTemplate["content"]) => void;
}) {
  const [templates, setTemplates] = useState<StepTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("step_templates")
      .select("id, name, description, content, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setTemplates((data as StepTemplate[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch templates when the modal opens; load() sets its own loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) load();
  }, [open, load]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert a template"
      description="Drop a saved setup block into this step."
    >
      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border py-12 text-center">
          <LayoutTemplate className="size-7 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a step as a template, or create one to reuse later.
          </p>
          <Link
            href="/admin/templates/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-muted active:scale-[0.97]"
          >
            <Plus className="size-4" /> New template
          </Link>
        </div>
      ) : (
        <ul className="grid gap-2">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onInsert(t.content);
                  onClose();
                }}
                className="flex w-full items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors duration-150 ease-[var(--ease-out)] hover:border-ring hover:bg-muted/50 active:scale-[0.99]"
              >
                <LayoutTemplate className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  {t.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
