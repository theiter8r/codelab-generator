import { createClient } from "@/lib/supabase/server";
import type {
  Lab,
  LabModule,
  LabProgress,
  LabStep,
  StepCompletion,
  StepTemplate,
} from "@/lib/types";

/** Published labs for the public catalog, optionally filtered by search/tag. */
export async function getPublishedLabs(opts?: { q?: string; tag?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("labs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.q) query = query.ilike("title", `%${opts.q}%`);
  if (opts?.tag) query = query.contains("tags", [opts.tag]);

  const { data } = await query;
  return (data as Lab[]) ?? [];
}

/** Distinct tags across published labs, for the catalog filter chips. */
export async function getPublishedTags() {
  const labs = await getPublishedLabs();
  const set = new Set<string>();
  labs.forEach((l) => l.tags?.forEach((t) => set.add(t)));
  return [...set].sort();
}

/** A single lab visible to the requester (published, or any when admin). */
export async function getLabBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("labs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Lab) ?? null;
}

export async function getLabById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("labs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Lab) ?? null;
}

export async function getLabModules(labId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_modules")
    .select("*")
    .eq("lab_id", labId)
    .order("position", { ascending: true });
  return (data as LabModule[]) ?? [];
}

export async function getLabSteps(labId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_steps")
    .select("*")
    .eq("lab_id", labId)
    .order("position", { ascending: true });
  return (data as LabStep[]) ?? [];
}

/** All labs (drafts + published) for the admin dashboard. */
export async function getStepById(stepId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_steps")
    .select("*")
    .eq("id", stepId)
    .maybeSingle();
  return (data as LabStep) ?? null;
}

export async function getAdminLabs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("labs")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as Lab[]) ?? [];
}

/** All of the admin's reusable step templates, newest-edited first. */
export async function getTemplates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("step_templates")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as StepTemplate[]) ?? [];
}

export async function getTemplateById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("step_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as StepTemplate) ?? null;
}

export async function getProgress(userId: string, labId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lab_id", labId)
    .maybeSingle();
  return (data as LabProgress) ?? null;
}

export async function getCompletions(userId: string, labId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("step_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("lab_id", labId);
  return (data as StepCompletion[]) ?? [];
}

export type ActivityCalendar = {
  /** 'YYYY-MM-DD' (UTC) -> number of steps completed that day. */
  counts: Record<string, number>;
  total: number;
  currentStreak: number;
  longestStreak: number;
};

const DAY_MS = 86_400_000;

function utcDateKey(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Derive totals + current/longest day streaks from a date->count map. */
function buildCalendar(counts: Record<string, number>): ActivityCalendar {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const now = new Date();
  const todayMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const has = (ms: number) => (counts[utcDateKey(ms)] ?? 0) > 0;

  // Current streak: count back from today (or yesterday if today is empty).
  let currentStreak = 0;
  let cursor = has(todayMs) ? todayMs : todayMs - DAY_MS;
  while (has(cursor)) {
    currentStreak++;
    cursor -= DAY_MS;
  }

  // Longest streak across the visible window.
  let longestStreak = 0;
  let run = 0;
  for (let ms = todayMs - 371 * DAY_MS; ms <= todayMs; ms += DAY_MS) {
    if (has(ms)) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  return { counts, total, currentStreak, longestStreak };
}

/**
 * A GitHub-style contribution calendar built from the learner's own step
 * completions (owner-scoped via RLS) over the last ~53 weeks.
 */
export async function getActivityCalendar(
  userId: string
): Promise<ActivityCalendar> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 372 * DAY_MS).toISOString();
  const { data } = await supabase
    .from("step_completions")
    .select("completed_at")
    .eq("user_id", userId)
    .gte("completed_at", since);

  const rows = (data as { completed_at: string }[]) ?? [];
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.completed_at.slice(0, 10)] =
      (counts[r.completed_at.slice(0, 10)] ?? 0) + 1; // UTC date bucket
  }
  return buildCalendar(counts);
}

/**
 * Same calendar, but for *any* user — built from the aggregated, publicly
 * callable `activity_calendar` RPC so it works for visitors and anon.
 */
export async function getPublicActivityCalendar(
  userId: string
): Promise<ActivityCalendar> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("activity_calendar", { uid: userId });
  const rows = (data as { day: string; count: number }[]) ?? [];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.day] = r.count;
  return buildCalendar(counts);
}

/** A public profile row (readable by anyone via RLS). */
export async function getPublicProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("id", id)
    .maybeSingle();
  return (
    (data as {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
      created_at: string;
    }) ?? null
  );
}

export type CompletedLab = {
  id: string;
  title: string;
  slug: string;
  completed_at: string;
};

/** Published labs a user has fully completed, via the public RPC. */
export async function getCompletedLabs(userId: string): Promise<CompletedLab[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("completed_labs", { uid: userId });
  return (data as CompletedLab[]) ?? [];
}

export type DashboardItem = {
  lab: Lab;
  completed: number;
  total: number;
  progress: LabProgress;
};

/** Labs the learner has started, with completion counts. */
export async function getDashboard(userId: string): Promise<DashboardItem[]> {
  const supabase = await createClient();

  const { data: progressRows } = await supabase
    .from("lab_progress")
    .select("*, labs(*)")
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false });

  const rows = (progressRows as (LabProgress & { labs: Lab })[]) ?? [];
  if (rows.length === 0) return [];

  const labIds = rows.map((r) => r.lab_id);

  const [{ data: completions }, { data: steps }] = await Promise.all([
    supabase
      .from("step_completions")
      .select("lab_id")
      .eq("user_id", userId)
      .in("lab_id", labIds),
    supabase.from("lab_steps").select("lab_id").in("lab_id", labIds),
  ]);

  const countBy = (arr: { lab_id: string }[] | null) => {
    const m = new Map<string, number>();
    (arr ?? []).forEach((r) => m.set(r.lab_id, (m.get(r.lab_id) ?? 0) + 1));
    return m;
  };
  const doneMap = countBy(completions as { lab_id: string }[]);
  const totalMap = countBy(steps as { lab_id: string }[]);

  return rows
    .filter((r) => r.labs)
    .map((r) => ({
      lab: r.labs,
      progress: r,
      completed: doneMap.get(r.lab_id) ?? 0,
      total: totalMap.get(r.lab_id) ?? 0,
    }));
}
