-- ============================================================================
-- Virtual Teaching Hospital — Supabase Setup
-- ============================================================================
-- Run this entire file ONCE in your Supabase SQL editor:
--   1. Open https://supabase.com/dashboard → your project → SQL Editor
--   2. Click "+ New query"
--   3. Paste this whole file
--   4. Click Run
--
-- This creates the tables, security policies, and seeds the 5 starter cases.
-- ============================================================================

-- ============== 1. SCHEMA ==============

create table if not exists public.cases (
  id text primary key,
  hospital text not null,
  department text,
  bed_number int,
  title text not null,
  chief_complaint text,
  system text,
  severity text,
  tags text[],
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int default 0,
  completed_stages jsonb default '{}'::jsonb,
  mcq_scores jsonb default '{}'::jsonb,
  badges text[] default '{}',
  teaching_mode text default 'advanced',
  updated_at timestamptz default now()
);

create table if not exists public.admins (
  email text primary key,
  added_at timestamptz default now()
);

create index if not exists idx_cases_hospital on public.cases(hospital);
create index if not exists idx_cases_department on public.cases(department);

-- ============== 2. ROW LEVEL SECURITY ==============

alter table public.cases enable row level security;
alter table public.progress enable row level security;
alter table public.admins enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Cases readable" on public.cases;
drop policy if exists "Admin insert cases" on public.cases;
drop policy if exists "Admin update cases" on public.cases;
drop policy if exists "Admin delete cases" on public.cases;
drop policy if exists "Users read own progress" on public.progress;
drop policy if exists "Users insert own progress" on public.progress;
drop policy if exists "Users update own progress" on public.progress;
drop policy if exists "Admins list readable" on public.admins;

-- Cases: anyone signed in can read; only admins can write
create policy "Cases readable"
  on public.cases for select
  to authenticated
  using (true);

create policy "Admin insert cases"
  on public.cases for insert to authenticated
  with check (auth.jwt() ->> 'email' in (select email from public.admins));

create policy "Admin update cases"
  on public.cases for update to authenticated
  using (auth.jwt() ->> 'email' in (select email from public.admins));

create policy "Admin delete cases"
  on public.cases for delete to authenticated
  using (auth.jwt() ->> 'email' in (select email from public.admins));

-- Progress: each user sees and writes only their own row
create policy "Users read own progress"
  on public.progress for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own progress"
  on public.progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own progress"
  on public.progress for update to authenticated
  using (auth.uid() = user_id);

-- Admins: any signed-in user can READ the admin list (so the app can check if they're an admin)
create policy "Admins list readable"
  on public.admins for select to authenticated
  using (true);

-- ============== 3. AUTO-UPDATE TIMESTAMPS ==============

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cases_updated on public.cases;
create trigger trg_cases_updated
  before update on public.cases
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_progress_updated on public.progress;
create trigger trg_progress_updated
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ============== 4. ADD YOURSELF AS ADMIN ==============
-- IMPORTANT: replace the email below with the email YOU will sign in with.
-- Then uncomment the line and run it.

-- insert into public.admins (email) values ('your.email@example.com')
-- on conflict (email) do nothing;

-- ============== 5. SEED THE 5 STARTER CASES ==============
-- The cases auto-populate on first sign-in, but you can also manually
-- insert them by running INSERT statements. The app handles seeding
-- automatically — just sign in once and they will appear.

-- ============================================================================
-- DONE. Now go to Project Settings → API and copy:
--   • Project URL
--   • anon / public key
-- Add them to .env.local (locally) and Vercel environment variables (online).
-- ============================================================================
