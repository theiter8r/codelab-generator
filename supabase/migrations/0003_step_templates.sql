-- Reusable step-content templates ("setup templates"): saved blocks of editor
-- content the admin can insert into any step instead of re-writing them.
-- Apply via the Supabase SQL editor or `supabase db push` (after 0001/0002).

create table if not exists step_templates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists step_templates_author_idx on step_templates (author_id);

create trigger step_templates_updated_at
  before update on step_templates
  for each row execute function set_updated_at();

-- Templates are private authoring tools: admin-only for every operation.
alter table step_templates enable row level security;

create policy "step_templates_admin_all" on step_templates
  for all using (is_admin()) with check (is_admin());
