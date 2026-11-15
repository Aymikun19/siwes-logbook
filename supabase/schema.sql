-- SIWES Logbook schema. Run in the Supabase SQL editor.

create table public.profiles (
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

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles on delete cascade,
  entry_date date not null,
  activities text not null,
  skills_learned text,
  hours numeric(4,1) not null default 8 check (hours between 0 and 24),
  created_at timestamptz not null default now(),
  unique (student_id, entry_date)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles on delete cascade,
  week_start date not null,
  supervisor_id uuid not null references public.profiles,
  status text not null check (status in ('approved', 'needs_changes')),
  comment text,
  reviewed_at timestamptz not null default now(),
  unique (student_id, week_start)
);

-- Create a profile row whenever someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is the current user the supervisor of this student?
create function public.supervises(student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles s
    join public.profiles me on me.id = auth.uid()
    where s.id = student and me.role = 'supervisor'
      and lower(s.supervisor_email) = lower(me.email)
  );
$$;

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.reviews enable row level security;

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.supervises(id));
create policy "update own profile" on public.profiles for update using (id = auth.uid());

create policy "student reads own entries" on public.entries for select
  using (student_id = auth.uid() or public.supervises(student_id));
create policy "student writes own entries" on public.entries for insert with check (student_id = auth.uid());
create policy "student edits own entries" on public.entries for update using (student_id = auth.uid());
create policy "student deletes own entries" on public.entries for delete using (student_id = auth.uid());

create policy "read reviews" on public.reviews for select
  using (student_id = auth.uid() or public.supervises(student_id));
create policy "supervisor reviews" on public.reviews for insert
  with check (supervisor_id = auth.uid() and public.supervises(student_id));
create policy "supervisor updates review" on public.reviews for update
  using (supervisor_id = auth.uid() and public.supervises(student_id));
