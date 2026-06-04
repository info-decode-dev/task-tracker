-- people a user can assign tasks to
create table if not exists public.assignees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.tasks
  add column if not exists deadline date,
  add column if not exists assignee_id uuid references public.assignees(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by text;

alter table public.assignees enable row level security;

create policy "assignees_select_own" on public.assignees
  for select using (auth.uid() = user_id);
create policy "assignees_insert_own" on public.assignees
  for insert with check (auth.uid() = user_id);
create policy "assignees_update_own" on public.assignees
  for update using (auth.uid() = user_id);
create policy "assignees_delete_own" on public.assignees
  for delete using (auth.uid() = user_id);

create index if not exists assignees_user_id_idx on public.assignees(user_id);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);
