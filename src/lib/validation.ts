import { z } from "zod";

export const labMetaSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  est_minutes: z.coerce.number().int().min(0).max(100000).optional(),
  tags: z.string().optional(), // comma-separated in the form
  cover_image_url: z.string().url().optional().or(z.literal("")),
});

export type LabMetaInput = z.infer<typeof labMetaSchema>;

export const templateMetaSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

export type TemplateMetaInput = z.infer<typeof templateMetaSchema>;

export function parseTags(input: string | undefined): string[] {
  if (!input) return [];
  return [
    ...new Set(
      input
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 12);
}
