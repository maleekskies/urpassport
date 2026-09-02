-- UrPassport NG: upgrades covering live visa data cache, flights/payments support,
-- document expiry tracking, family members, notification log, AI rate limiting.

-- ========== DOCUMENTS: expiry tracking ==========
alter table documents add column if not exists expiry_date date;
alter table documents add column if not exists reminder_sent_at timestamptz;

-- ========== USERS: notification preference ==========
alter table users add column if not exists notify_email boolean not null default true;

-- ========== FAMILY MEMBERS ==========
-- Lets a user manage passport/visa applications on behalf of dependants.
-- No raw NIN/passport numbers stored, hashed the same way as users.nin_hash.
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete cascade not null,
  full_name text not null,
  relationship text,
  date_of_birth date,
  nin_hash text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_family_members_owner on family_members(owner_user_id);

alter table applications add column if not exists family_member_id uuid references family_members(id) on delete set null;

-- ========== AI USAGE LOG (rate limiting the Trip Planner) ==========
create table if not exists ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  feature text not null default 'trip_planner',
  created_at timestamptz default now()
);
create index if not exists idx_ai_usage_user_date on ai_usage_log(user_id, created_at);

-- ========== NOTIFICATION LOG ==========
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  channel text not null default 'email',
  subject text not null,
  related_type text,
  related_id uuid,
  sent_at timestamptz default now()
);
create index if not exists idx_notification_log_user on notification_log(user_id);

-- ========== VISA REQUIREMENTS CACHE ==========
-- Shared reference cache for the live visa-requirements API (Travel Buddy /
-- RapidAPI). Not user-owned data: every signed-in user can read it, and the
-- app itself writes through it on a cache miss, so inserts/updates are
-- allowed for any authenticated request rather than gated to one owner.
create table if not exists visa_requirements_cache (
  id uuid primary key default gen_random_uuid(),
  passport_code text not null,
  destination_code text not null,
  data jsonb not null,
  fetched_at timestamptz default now(),
  expires_at timestamptz not null,
  unique (passport_code, destination_code)
);

-- ========== RLS ==========
alter table family_members enable row level security;
alter table ai_usage_log enable row level security;
alter table notification_log enable row level security;
alter table visa_requirements_cache enable row level security;

create policy "Users manage their own family members" on family_members
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

create policy "Users manage their own AI usage log" on ai_usage_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read their own notification log" on notification_log
  for select using (auth.uid() = user_id);
-- Inserts to notification_log happen from the cron route using the service
-- role key, which bypasses RLS entirely, so no insert policy is needed here.

create policy "Anyone signed in can read the visa cache" on visa_requirements_cache
  for select using (auth.role() = 'authenticated');
create policy "Anyone signed in can write through the visa cache" on visa_requirements_cache
  for insert with check (auth.role() = 'authenticated');
create policy "Anyone signed in can refresh the visa cache" on visa_requirements_cache
  for update using (auth.role() = 'authenticated');
