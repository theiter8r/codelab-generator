-- Public profile support. `step_completions` is owner-only under RLS, so to let
-- anyone view a learner's journey we expose *aggregated* data (daily counts and
-- finished labs) through SECURITY DEFINER functions — never the raw rows.
-- Apply via the Supabase SQL editor or `supabase db push` (after 0001–0003).

-- Daily step-completion counts for a user over the last ~53 weeks (UTC days).
create or replace function public.activity_calendar(uid uuid)
returns table (day date, count integer)
language sql
security definer
set search_path = public
stable
as $$
  select (completed_at at time zone 'UTC')::date as day, count(*)::int
  from step_completions
  where user_id = uid
    and completed_at >= (now() - interval '372 days')
  group by 1
  order by 1;
$$;

grant execute on function public.activity_calendar(uuid) to anon, authenticated;

-- Published labs a user has fully completed (all steps), newest first.
create or replace function public.completed_labs(uid uuid)
returns table (id uuid, title text, slug text, completed_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select l.id, l.title, l.slug, max(sc.completed_at) as completed_at
  from labs l
  join lab_steps st on st.lab_id = l.id
  join step_completions sc on sc.step_id = st.id and sc.user_id = uid
  where l.status = 'published'
  group by l.id, l.title, l.slug
  having count(distinct st.id) = (
    select count(*) from lab_steps where lab_id = l.id
  )
  order by max(sc.completed_at) desc;
$$;

grant execute on function public.completed_labs(uuid) to anon, authenticated;
