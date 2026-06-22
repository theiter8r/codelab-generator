import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLab } from "@/lib/actions/labs";
import { LabMetaForm } from "@/components/admin/lab-meta-form";

export const metadata = { title: "New lab" };

export default function NewLabPage() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to labs
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Create a lab</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Set the basics — you&apos;ll add steps next.
      </p>
      <LabMetaForm action={createLab} submitLabel="Create lab" />
    </div>
  );
}
