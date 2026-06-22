-- Reusable simulation library: named architecture/process simulations the admin
-- can save once and insert into any step, instead of rebuilding them each time.
-- The spec shape matches the inline simulation stored in lab_steps.content; here
-- it lives in its own row so it can be reused across steps and labs.
-- Apply via the Supabase SQL editor or `supabase db push` (after 0001-0005).

create table if not exists simulations (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  spec jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists simulations_author_idx on simulations (author_id);

create trigger simulations_updated_at
  before update on simulations
  for each row execute function set_updated_at();

-- The library is a private authoring tool: admin-only for every operation.
-- (Inserted simulations travel inside a step's content, governed by lab RLS, so
-- learners never need to read this table directly.)
alter table simulations enable row level security;

create policy "simulations_admin_all" on simulations
  for all using (is_admin()) with check (is_admin());
