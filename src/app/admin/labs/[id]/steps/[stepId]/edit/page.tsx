import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLabById, getStepById } from "@/lib/queries";
import { StepEditor } from "@/components/admin/step-editor";

export const metadata = { title: "Edit step" };

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const [lab, step] = await Promise.all([getLabById(id), getStepById(stepId)]);
  if (!lab || !step || step.lab_id !== id) notFound();

  return (
    <div className="animate-fade-up">
      <Link
        href={`/admin/labs/${id}/edit`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {lab.title}
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit step</h1>
      <StepEditor
        stepId={step.id}
        labId={id}
        initialTitle={step.title}
        initialContent={step.content}
        initialHint={step.hint}
      />
    </div>
  );
}
