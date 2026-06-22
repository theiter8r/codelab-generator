import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTemplateById } from "@/lib/queries";
import { TemplateEditor } from "@/components/admin/template-editor";

export const metadata = { title: "Edit template" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  return (
    <div className="animate-fade-up">
      <Link
        href="/admin/templates"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to templates
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit template</h1>
      <TemplateEditor
        templateId={template.id}
        initialName={template.name}
        initialDescription={template.description ?? ""}
        initialContent={template.content}
      />
    </div>
  );
}
