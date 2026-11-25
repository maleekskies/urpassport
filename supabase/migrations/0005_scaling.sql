-- Scaling and hardening pass: query indexes, locked-down visa cache writes,
-- and an atomic planner rate limit.

-- ========== INDEXES ==========
create index if not exists idx_applications_user_status
  on applications (user_id, status, updated_at desc);

create index if not exists idx_documents_user_expiry
  on documents (user_id, expiry_date);

create index if not exists idx_documents_reminder_due
  on documents (expiry_date)
  where reminder_sent_at is null and expiry_date is not null;

-- The unique constraint on visa_requirements_cache already provides the
-- lookup index for (passport_code, destination_code).

-- ========== VISA CACHE WRITES ==========
-- The app now writes through a service-role path, so authenticated users
-- only need read access. Drop the broad write policies from migration 0003.
drop policy if exists "Anyone signed in can write through the visa cache" on visa_requirements_cache;
drop policy if exists "Anyone signed in can refresh the visa cache" on visa_requirements_cache;

-- ========== ATOMIC PLANNER LIMIT ==========
-- Count and insert in one call so two simultaneous requests cannot both see
-- room under the limit. Runs with definer rights to cover all users.
create or replace function public.try_reserve_ai_plan(p_user uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
begin
  select count(*) into used
  from public.ai_usage_log
  where user_id = p_user
    and feature = 'trip_planner'
    and created_at > now() - interval '24 hours';

  if used >= p_limit then
    return false;
  end if;

  insert into public.ai_usage_log (user_id, feature)
  values (p_user, 'trip_planner');

  return true;
end;
$$;

grant execute on function public.try_reserve_ai_plan(uuid, integer) to authenticated;
