-- sections: user-owned groupings
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- tasks: belong to a section, track completion
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sections enable row level security;
alter table public.tasks enable row level security;

create policy "sections_select_own" on public.sections for select using (auth.uid() = user_id);
create policy "sections_insert_own" on public.sections for insert with check (auth.uid() = user_id);
create policy "sections_update_own" on public.sections for update using (auth.uid() = user_id);
create policy "sections_delete_own" on public.sections for delete using (auth.uid() = user_id);

create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

create index sections_user_id_idx on public.sections(user_id);
create index tasks_section_id_idx on public.tasks(section_id);
create index tasks_user_id_idx on public.tasks(user_id);
