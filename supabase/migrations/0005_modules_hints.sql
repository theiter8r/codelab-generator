-- Modules (group steps into sections) + per-step hints + a per-learner
-- "with/without hints" preference. Apply after 0001–0004.

-- Modules ------------------------------------------------------------------
create table if not exists lab_modules (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references labs(id) on delete cascade,
  position integer not null,
  title text not null default 'Untitled module',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lab_id, position)
);

create index if not exists lab_modules_lab_idx on lab_modules (lab_id, position);

create trigger lab_modules_updated_at
  before update on lab_modules
  for each row execute function set_updated_at();

-- Steps gain a module + an optional hint document.
alter table lab_steps
  add column if not exists module_id uuid references lab_modules(id) on delete set null;
alter table lab_steps
  add column if not exists hint jsonb;

-- Learner preference: do the lab with hints shown or not.
alter table lab_progress
  add column if not exists hints_enabled boolean not null default true;

-- RLS: modules visible when parent lab is published (or to admin); admin writes.
alter table lab_modules enable row level security;

create policy "lab_modules_select" on lab_modules
  for select using (
    is_admin()
    or exists (
      select 1 from labs
      where labs.id = lab_modules.lab_id and labs.status = 'published'
    )
  );

create policy "lab_modules_admin_write" on lab_modules
  for all using (is_admin()) with check (is_admin());
