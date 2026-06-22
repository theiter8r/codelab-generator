-- CodeLabs initial schema: profiles, labs, steps, progress + RLS.
-- Apply via the Supabase SQL editor or `supabase db push`.

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'learner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lab_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type difficulty as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

-- Updated-at helper --------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -----------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role user_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Admin check helper (used by RLS policies).
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- labs ---------------------------------------------------------------------
create table if not exists labs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  summary text,
  cover_image_url text,
  difficulty difficulty not null default 'beginner',
  est_minutes integer,
  tags text[] not null default '{}',
  status lab_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists labs_status_idx on labs (status);
create index if not exists labs_tags_idx on labs using gin (tags);

create trigger labs_updated_at
  before update on labs
  for each row execute function set_updated_at();

-- lab_steps ----------------------------------------------------------------
create table if not exists lab_steps (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references labs(id) on delete cascade,
  position integer not null,
  title text not null default 'Untitled step',
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lab_id, position)
);

create index if not exists lab_steps_lab_idx on lab_steps (lab_id, position);

create trigger lab_steps_updated_at
  before update on lab_steps
  for each row execute function set_updated_at();

-- lab_progress -------------------------------------------------------------
create table if not exists lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lab_id uuid not null references labs(id) on delete cascade,
  current_step_position integer not null default 0,
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, lab_id)
);

create index if not exists lab_progress_user_idx on lab_progress (user_id);

-- step_completions ---------------------------------------------------------
create table if not exists step_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lab_id uuid not null references labs(id) on delete cascade,
  step_id uuid not null references lab_steps(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create index if not exists step_completions_user_lab_idx
  on step_completions (user_id, lab_id);

-- Row Level Security -------------------------------------------------------
alter table profiles enable row level security;
alter table labs enable row level security;
alter table lab_steps enable row level security;
alter table lab_progress enable row level security;
alter table step_completions enable row level security;

-- profiles: readable by all authenticated users; self-update only.
create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_update_self" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- labs: published labs are world-readable; admins see/manage everything.
create policy "labs_select_published" on labs
  for select using (status = 'published' or is_admin());

create policy "labs_admin_insert" on labs
  for insert with check (is_admin());

create policy "labs_admin_update" on labs
  for update using (is_admin()) with check (is_admin());

create policy "labs_admin_delete" on labs
  for delete using (is_admin());

-- lab_steps: visible when the parent lab is published, or to admins.
create policy "lab_steps_select" on lab_steps
  for select using (
    is_admin()
    or exists (
      select 1 from labs
      where labs.id = lab_steps.lab_id and labs.status = 'published'
    )
  );

create policy "lab_steps_admin_write" on lab_steps
  for all using (is_admin()) with check (is_admin());

-- lab_progress: each user owns their rows.
create policy "lab_progress_owner" on lab_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- step_completions: each user owns their rows.
create policy "step_completions_owner" on step_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
