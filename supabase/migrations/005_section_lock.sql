alter table public.sections
  add column if not exists locked boolean not null default false;

create or replace function public.can_access_section(section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sections s
    where s.id = section_id
      and s.workspace_id = public.current_workspace_id()
      and (
        public.is_admin()
        or not s.locked
      )
  );
$$;

create or replace function public.can_manage_section(section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sections s
    where s.id = section_id
      and s.workspace_id = public.current_workspace_id()
      and (
        public.is_admin()
        or (s.created_by = auth.uid() and not s.locked)
      )
  );
$$;

-- members cannot read tasks inside locked sections
drop policy if exists "tasks_select_workspace" on public.tasks;

create policy "tasks_select_workspace" on public.tasks
  for select using (
    workspace_id = public.current_workspace_id()
    and public.can_access_section(section_id)
  );
