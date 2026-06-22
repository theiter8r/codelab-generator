import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Returns the authenticated user (verified via getUser) or null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Authenticated user plus their profile row, or null when signed out. */
export async function getSessionContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null };
}

/** Redirect to login unless authenticated; returns the user. */
export async function requireUser(redirectTo = "/login") {
  const user = await getUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Redirect non-admins away; returns the admin's profile. */
export async function requireAdmin() {
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login?redirect=/admin");
  if (!profile || profile.role !== "admin") redirect("/");
  return profile;
}
