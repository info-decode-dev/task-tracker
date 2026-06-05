create type public.timeline_status as enum ('hold', 'progress', 'complete');

create table public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  description text,
  status public.timeline_status not null default 'hold',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_items_title_check check (char_length(trim(title)) > 0)
);

create index timeline_items_workspace_user_idx
  on public.timeline_items (workspace_id, user_id, scheduled_at asc);

create or replace function public.is_workspace_member(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and (
        p.id = public.current_workspace_id()
        or p.admin_id = public.current_workspace_id()
      )
  );
$$;

alter table public.timeline_items enable row level security;

create policy "timeline_items_select" on public.timeline_items
  for select using (
    workspace_id = public.current_workspace_id()
    and (
      user_id = auth.uid()
      or public.is_admin()
    )
  );

create policy "timeline_items_insert" on public.timeline_items
  for insert with check (
    workspace_id = public.current_workspace_id()
    and public.is_workspace_member(user_id)
    and (user_id = auth.uid() or public.is_admin())
  );

create policy "timeline_items_update" on public.timeline_items
  for update using (
    workspace_id = public.current_workspace_id()
    and (user_id = auth.uid() or public.is_admin())
  );

create policy "timeline_items_delete" on public.timeline_items
  for delete using (
    workspace_id = public.current_workspace_id()
    and (user_id = auth.uid() or public.is_admin())
  );
