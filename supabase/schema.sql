-- Everything lives in the "siwes" schema so this app can share a Supabase project with others.
-- After running, add "siwes" under Supabase → Project Settings → Data API → Exposed schemas.
create schema if not exists siwes;
grant usage on schema siwes to anon, authenticated, service_role;
alter default privileges in schema siwes grant all on tables to anon, authenticated, service_role;
alter default privileges in schema siwes grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema siwes grant execute on functions to anon, authenticated, service_role;

-- SIWES Logbook schema. Run in the Supabase SQL editor.

create table siwes.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'student' check (role in ('student', 'supervisor')),
  matric_no text,
  institution text,
  company text,
  supervisor_email text,
  created_at timestamptz not null default now()
);

create table siwes.entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references siwes.profiles on delete cascade,
  entry_date date not null,
  activities text not null,
  skills_learned text,
  hours numeric(4,1) not null default 8 check (hours between 0 and 24),
  created_at timestamptz not null default now(),
  unique (student_id, entry_date)
);

create table siwes.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references siwes.profiles on delete cascade,
  week_start date not null,
  supervisor_id uuid not null references siwes.profiles,
  status text not null check (status in ('approved', 'needs_changes')),
  comment text,
  reviewed_at timestamptz not null default now(),
  unique (student_id, week_start)
);

-- Create a profile row whenever someone signs up.
create function siwes.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into siwes.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function siwes.handle_new_user();

-- Is the current user the supervisor of this student?
create function siwes.supervises(student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from siwes.profiles s
    join siwes.profiles me on me.id = auth.uid()
    where s.id = student and me.role = 'supervisor'
      and lower(s.supervisor_email) = lower(me.email)
  );
$$;

alter table siwes.profiles enable row level security;
alter table siwes.entries enable row level security;
alter table siwes.reviews enable row level security;

create policy "own profile" on siwes.profiles for select using (id = auth.uid() or siwes.supervises(id));
create policy "update own profile" on siwes.profiles for update using (id = auth.uid());

create policy "student reads own entries" on siwes.entries for select
  using (student_id = auth.uid() or siwes.supervises(student_id));
create policy "student writes own entries" on siwes.entries for insert with check (student_id = auth.uid());
create policy "student edits own entries" on siwes.entries for update using (student_id = auth.uid());
create policy "student deletes own entries" on siwes.entries for delete using (student_id = auth.uid());

create policy "read reviews" on siwes.reviews for select
  using (student_id = auth.uid() or siwes.supervises(student_id));
create policy "supervisor reviews" on siwes.reviews for insert
  with check (supervisor_id = auth.uid() and siwes.supervises(student_id));
create policy "supervisor updates review" on siwes.reviews for update
  using (supervisor_id = auth.uid() and siwes.supervises(student_id));

-- Table access is still governed by the RLS policies above.
grant all on all tables in schema siwes to anon, authenticated, service_role;
grant all on all sequences in schema siwes to anon, authenticated, service_role;
grant execute on all functions in schema siwes to anon, authenticated, service_role;
