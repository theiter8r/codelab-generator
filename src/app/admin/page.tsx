import Link from "next/link";
import { Plus, FileText, LayoutTemplate } from "lucide-react";
import { getAdminLabs } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Author labs" };

export default async function AdminPage() {
  const labs = await getAdminLabs();

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your labs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and publish your code labs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/templates">
              <LayoutTemplate className="size-4" /> Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/labs/new">
              <Plus className="size-4" /> New lab
            </Link>
          </Button>
        </div>
      </div>

      {labs.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No labs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first lab to get started.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/admin/labs/new">
              <Plus className="size-4" /> New lab
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="stagger mt-6 grid gap-2">
          {labs.map((lab, i) => (
            <li key={lab.id} style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/admin/labs/${lab.id}/edit`}
                className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lab.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{lab.slug} · updated {formatDate(lab.updated_at)}
                  </p>
                </div>
                <Badge variant={lab.status === "published" ? "success" : "outline"}>
                  {lab.status}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
