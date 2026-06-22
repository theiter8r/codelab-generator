/** Shared domain types mirroring the Supabase schema (see supabase/migrations). */
import type { JSONContent } from "@tiptap/core";

export type UserRole = "admin" | "learner";
export type LabStatus = "draft" | "published";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lab {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  difficulty: Difficulty;
  est_minutes: number | null;
  tags: string[];
  status: LabStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Tiptap document JSON — aliased to the editor's own JSONContent shape. */
export type TiptapDoc = JSONContent;

export interface LabModule {
  id: string;
  lab_id: string;
  position: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabStep {
  id: string;
  lab_id: string;
  module_id: string | null;
  position: number;
  title: string;
  content: TiptapDoc | null;
  hint: TiptapDoc | null;
  created_at: string;
  updated_at: string;
}

export interface LabProgress {
  id: string;
  user_id: string;
  lab_id: string;
  current_step_position: number;
  hints_enabled: boolean;
  last_viewed_at: string;
  created_at: string;
}

export interface StepCompletion {
  id: string;
  user_id: string;
  lab_id: string;
  step_id: string;
  completed_at: string;
}

/** A saved, reusable block of step content the admin can insert into any step. */
export interface StepTemplate {
  id: string;
  author_id: string;
  name: string;
  description: string | null;
  content: TiptapDoc | null;
  created_at: string;
  updated_at: string;
}

/** An image in the `lab-assets` storage pool, resolved to a public URL. */
export interface MediaAsset {
  name: string;
  path: string;
  url: string;
  created_at: string | null;
}
