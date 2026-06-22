-- Make simulations the source of truth for step-embedded diagrams.
-- A step's content now stores only a simulation's UUID; the spec lives in the
-- `simulations` table and is fetched by id. Apply after 0006.

-- Step-embedded simulations are unnamed rows (the library only lists named ones).
alter table simulations alter column name drop not null;

-- Public read of a single spec by id. Learners need to render a published lab's
-- simulation but must not see the whole library, so this SECURITY DEFINER
-- function returns just one spec for a known UUID (the id is already embedded in
-- the published step content). Mirrors the public-profile functions in 0004.
create or replace function public.simulation_spec(p_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select spec from simulations where id = p_id
$$;

grant execute on function public.simulation_spec(uuid) to anon, authenticated;
