import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateEditor } from "@/components/admin/template-editor";

export const metadata = { title: "New template" };

export default function NewTemplatePage() {
  return (
    <div className="animate-fade-up">
      <Link
        href="/admin/templates"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to templates
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New template</h1>
      <TemplateEditor />
    </div>
  );
}
