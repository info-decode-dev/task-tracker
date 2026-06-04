create table public.workspace_niches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  constraint workspace_niches_message_check check (char_length(trim(message)) > 0)
);

create index workspace_niches_workspace_id_idx
  on public.workspace_niches (workspace_id, position asc);

alter table public.workspace_niches enable row level security;

create policy "workspace_niches_select_workspace" on public.workspace_niches
  for select using (workspace_id = public.current_workspace_id());

create policy "workspace_niches_insert_admin" on public.workspace_niches
  for insert with check (
    public.is_admin()
    and workspace_id = public.current_workspace_id()
  );

create policy "workspace_niches_update_admin" on public.workspace_niches
  for update using (
    public.is_admin()
    and workspace_id = public.current_workspace_id()
  );

create policy "workspace_niches_delete_admin" on public.workspace_niches
  for delete using (
    public.is_admin()
    and workspace_id = public.current_workspace_id()
  );
