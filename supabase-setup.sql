-- ============================================================================
-- Virtual Teaching Hospital — Supabase setup (safe to re-run)
-- Supabase dashboard → SQL Editor → New query → paste → Run.
-- It keeps any existing data and only adds what is missing.
-- ============================================================================

-- 1. Tables ------------------------------------------------------------------
create table if not exists public.cases (
  id text primary key,
  hospital text not null,
  department text,
  bed_number int,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.cases add column if not exists case_type text default 'rich-html';
alter table public.cases add column if not exists html_url text;

create table if not exists public.admins (
  email text primary key,
  added_at timestamptz default now()
);

-- 2. Row-level security --------------------------------------------------------
alter table public.cases enable row level security;
alter table public.admins enable row level security;

drop policy if exists "Cases readable" on public.cases;
drop policy if exists "Admin insert cases" on public.cases;
drop policy if exists "Admin update cases" on public.cases;
drop policy if exists "Admin delete cases" on public.cases;
drop policy if exists "Admins list readable" on public.admins;

-- Signed-in users can read cases; only admins can write them.
create policy "Cases readable" on public.cases for select to authenticated using (true);
create policy "Admin insert cases" on public.cases for insert to authenticated
  with check (auth.jwt() ->> 'email' in (select email from public.admins));
create policy "Admin update cases" on public.cases for update to authenticated
  using (auth.jwt() ->> 'email' in (select email from public.admins));
create policy "Admin delete cases" on public.cases for delete to authenticated
  using (auth.jwt() ->> 'email' in (select email from public.admins));
create policy "Admins list readable" on public.admins for select to authenticated using (true);

-- 3. updated_at ---------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_cases_updated on public.cases;
create trigger trg_cases_updated before update on public.cases
  for each row execute function public.touch_updated_at();

-- 4. Storage bucket for the uploaded HTML files ------------------------------
insert into storage.buckets (id, name, public) values ('rich-cases', 'rich-cases', true)
  on conflict (id) do nothing;

drop policy if exists "Rich cases public read" on storage.objects;
drop policy if exists "Rich cases admin write" on storage.objects;
drop policy if exists "Rich cases admin delete" on storage.objects;
create policy "Rich cases public read" on storage.objects for select
  using (bucket_id = 'rich-cases');
create policy "Rich cases admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'rich-cases' and auth.jwt() ->> 'email' in (select email from public.admins));
create policy "Rich cases admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'rich-cases' and auth.jwt() ->> 'email' in (select email from public.admins));

-- 5. Make yourself an admin (replace the email, then run this line) ------------
-- insert into public.admins (email) values ('you@example.com') on conflict do nothing;
