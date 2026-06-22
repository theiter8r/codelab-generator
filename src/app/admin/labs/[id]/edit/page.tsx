import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Lightbulb, Plus, Trash2 } from "lucide-react";
import { getLabById, getLabModules, getLabSteps } from "@/lib/queries";
import {
  createModule,
  createStep,
  deleteModule,
  deleteStep,
  moveModule,
  moveStep,
  updateLab,
} from "@/lib/actions/labs";
import { LabMetaForm } from "@/components/admin/lab-meta-form";
import { ModuleForm } from "@/components/admin/module-form";
import { StepModuleSelect } from "@/components/admin/step-module-select";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { DeleteLabButton } from "@/components/admin/delete-lab-button";
import { Button } from "@/components/ui/button";
import { isDocEmpty } from "@/lib/utils";

export const metadata = { title: "Edit lab" };

export default async function EditLabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = await getLabById(id);
  if (!lab) notFound();

  const [steps, modules] = await Promise.all([
    getLabSteps(id),
    getLabModules(id),
  ]);
  const updateAction = updateLab.bind(null, id);

  return (
    <div className="animate-fade-up">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to labs
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{lab.title}</h1>
        <div className="flex items-center gap-2">
          {lab.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/labs/${lab.slug}`} target="_blank">
                <ExternalLink className="size-4" /> View
              </Link>
            </Button>
          )}
          <DeleteLabButton labId={lab.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Steps + modules */}
        <section className="order-2 grid gap-8 lg:order-1">
          {/* Modules */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Modules</h2>
                <p className="text-sm text-muted-foreground">
                  Group steps into sections. Assign steps to a module below.
                </p>
              </div>
              <form action={createModule.bind(null, lab.id)}>
                <Button type="submit" size="sm" variant="secondary">
                  <Plus className="size-4" /> Add module
                </Button>
              </form>
            </div>

            {modules.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                No modules yet. Steps without a module appear ungrouped.
              </p>
            ) : (
              <ol className="mt-4 grid gap-2">
                {modules.map((m, i) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <ModuleForm
                      moduleId={m.id}
                      labId={lab.id}
                      initialTitle={m.title}
                      initialDescription={m.description ?? ""}
                    />
                    <div className="flex shrink-0 items-center gap-0.5">
                      <form action={moveModule.bind(null, m.id, lab.id, "up")}>
                        <IconSubmit label="Move up" disabled={i === 0}>
                          <ChevronUp className="size-4" />
                        </IconSubmit>
                      </form>
                      <form action={moveModule.bind(null, m.id, lab.id, "down")}>
                        <IconSubmit label="Move down" disabled={i === modules.length - 1}>
                          <ChevronDown className="size-4" />
                        </IconSubmit>
                      </form>
                      <form action={deleteModule.bind(null, m.id, lab.id)}>
                        <IconSubmit label="Delete module" destructive>
                          <Trash2 className="size-4" />
                        </IconSubmit>
                      </form>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Steps */}
          <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Steps</h2>
            <form action={createStep.bind(null, lab.id)}>
              <Button type="submit" size="sm" variant="secondary">
                <Plus className="size-4" /> Add step
              </Button>
            </form>
          </div>

          {steps.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No steps yet. Add your first step to start writing.
            </p>
          ) : (
            <ol className="mt-4 grid gap-2">
              {steps.map((step, i) => (
                <li
                  key={step.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <Link
                    href={`/admin/labs/${lab.id}/steps/${step.id}/edit`}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                  >
                    {step.title}
                  </Link>
                  {!isDocEmpty(step.hint) && (
                    <span
                      title="Has a hint"
                      className="inline-flex items-center"
                    >
                      <Lightbulb className="size-4 text-[var(--warning)]" />
                    </span>
                  )}
                  <StepModuleSelect
                    stepId={step.id}
                    labId={lab.id}
                    modules={modules}
                    value={step.module_id}
                  />
                  <div className="flex items-center gap-0.5">
                    <form action={moveStep.bind(null, step.id, lab.id, "up")}>
                      <IconSubmit label="Move up" disabled={i === 0}>
                        <ChevronUp className="size-4" />
                      </IconSubmit>
                    </form>
                    <form action={moveStep.bind(null, step.id, lab.id, "down")}>
                      <IconSubmit label="Move down" disabled={i === steps.length - 1}>
                        <ChevronDown className="size-4" />
                      </IconSubmit>
                    </form>
                    <form action={deleteStep.bind(null, step.id, lab.id)}>
                      <IconSubmit label="Delete step" destructive>
                        <Trash2 className="size-4" />
                      </IconSubmit>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          )}
          </div>
        </section>

        {/* Sidebar: publish + metadata */}
        <aside className="order-1 grid content-start gap-6 lg:order-2">
          <PublishToggle
            labId={lab.id}
            published={lab.status === "published"}
            canPublish={steps.length > 0}
          />
          <div>
            <h2 className="mb-3 text-lg font-semibold">Details</h2>
            <LabMetaForm
              action={updateAction}
              submitLabel="Save details"
              successLabel="Saved"
              defaults={{
                title: lab.title,
                summary: lab.summary,
                difficulty: lab.difficulty,
                est_minutes: lab.est_minutes,
                tags: lab.tags,
                cover_image_url: lab.cover_image_url,
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function IconSubmit({
  label,
  disabled,
  destructive,
  children,
}: {
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`grid size-7 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none ${
        destructive ? "hover:!text-destructive" : ""
      }`}
    >
      {children}
    </button>
  );
}
