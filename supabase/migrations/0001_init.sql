-- UrPassport NG — initial schema + RLS
-- Run this in the Supabase SQL Editor, or via `supabase db push` if you're
-- using the Supabase CLI locally.

create extension if not exists "pgcrypto";

-- ========== USERS ==========
-- Mirrors auth.users (id matches auth.users.id) so we can join app data to it
-- and attach profile fields Supabase Auth doesn't store.
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text,
  nin_hash text,
  auth_provider text default 'email',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========== APPLICATION TYPES (reference/content table) ==========
create table if not exists application_types (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('passport','visa')),
  destination text,
  visa_subtype text,
  display_name text not null,
  fee_amount numeric,
  fee_currency text,
  processing_time_min_days int,
  processing_time_max_days int,
  document_requirements jsonb not null default '[]',
  process_steps jsonb not null default '[]',
  common_pitfalls jsonb,
  last_verified_date date not null default current_date,
  created_at timestamptz default now()
);

-- ========== APPLICATIONS ==========
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  application_type_id uuid references application_types(id) not null,
  status text default 'not_started' check (status in
    ('not_started','in_progress','action_needed','on_track','submitted','approved','rejected')),
  current_step int default 1,
  completion_percent int default 0,
  checklist_state jsonb default '{}',
  reference_number text,
  submitted_at timestamptz,
  decision_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========== APPLICATION EVENTS ==========
create table if not exists application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  event_type text not null,
  event_label text not null,
  occurred_at timestamptz default now()
);

-- ========== DOCUMENTS (the Vault) ==========
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  document_type text not null,
  file_url text not null,
  file_name text not null,
  file_size_bytes int,
  verification_status text default 'pending' check (verification_status in ('pending','verified','rejected')),
  linked_application_id uuid references applications(id) on delete set null,
  uploaded_at timestamptz default now()
);

-- ========== ITINERARIES ==========
create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  linked_application_id uuid references applications(id) on delete set null,
  destination text not null,
  start_date date,
  end_date date,
  budget_ngn numeric,
  purpose text,
  plan_json jsonb not null,
  ai_model_version text,
  created_at timestamptz default now()
);

-- ========== BOOKINGS ==========
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  linked_itinerary_id uuid references itineraries(id) on delete set null,
  booking_type text not null check (booking_type in ('flight','hotel')),
  provider text,
  origin text,
  destination text,
  depart_date date,
  return_date date,
  price_ngn numeric,
  status text default 'searched' check (status in ('searched','held','booked','cancelled')),
  provider_reference text,
  created_at timestamptz default now()
);

-- ========== PAYMENTS ==========
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  linked_application_id uuid references applications(id) on delete set null,
  linked_booking_id uuid references bookings(id) on delete set null,
  amount numeric not null,
  currency text default 'NGN',
  purpose text not null,
  paystack_reference text unique,
  status text default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz default now()
);

-- ========== INDEXES ==========
create index if not exists idx_documents_user on documents(user_id);
create index if not exists idx_applications_user on applications(user_id);
create index if not exists idx_applications_status on applications(status);
create index if not exists idx_events_application on application_events(application_id);
create index if not exists idx_itineraries_user on itineraries(user_id);
create index if not exists idx_bookings_user on bookings(user_id);

-- ========== ROW-LEVEL SECURITY ==========
-- application_types is public reference content (no user_id) — readable by
-- anyone signed in, writable only via the Supabase dashboard/service role.
alter table users enable row level security;
alter table application_types enable row level security;
alter table applications enable row level security;
alter table application_events enable row level security;
alter table documents enable row level security;
alter table itineraries enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;

create policy "Users can view their own profile" on users
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on users
  for update using (auth.uid() = id);
create policy "Users can insert their own profile" on users
  for insert with check (auth.uid() = id);

create policy "Anyone signed in can read application types" on application_types
  for select using (auth.role() = 'authenticated');

create policy "Users manage their own applications" on applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read events for their own applications" on application_events
  for select using (
    exists (select 1 from applications a where a.id = application_id and a.user_id = auth.uid())
  );
create policy "Users insert events for their own applications" on application_events
  for insert with check (
    exists (select 1 from applications a where a.id = application_id and a.user_id = auth.uid())
  );

create policy "Users manage their own documents" on documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own itineraries" on itineraries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own bookings" on bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own payments" on payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a `users` row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
