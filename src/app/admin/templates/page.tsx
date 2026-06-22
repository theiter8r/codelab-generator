import Link from "next/link";
import { LayoutTemplate, Plus } from "lucide-react";
import { getTemplates } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable setup blocks you can drop into any step.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="size-4" /> New template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <LayoutTemplate className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a template, or use “Save as template” inside the step editor.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/admin/templates/new">
              <Plus className="size-4" /> New template
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="stagger mt-6 grid gap-2">
          {templates.map((t, i) => (
            <li key={t.id} style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/admin/templates/${t.id}/edit`}
                className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-muted/50"
              >
                <LayoutTemplate className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.description
                      ? `${t.description} · `
                      : ""}
                    updated {formatDate(t.updated_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
