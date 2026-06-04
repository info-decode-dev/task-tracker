-- roles: admin (workspace owner) and member (team user)
create type public.user_role as enum ('admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null default 'member',
  admin_id uuid references auth.users(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now(),
  constraint profiles_admin_id_check check (
    (role = 'admin' and admin_id is null)
    or (role = 'member' and admin_id is not null)
  )
);

create index profiles_admin_id_idx on public.profiles(admin_id);
create index profiles_role_idx on public.profiles(role);

-- team workspace columns
alter table public.sections
  add column if not exists workspace_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_by uuid references auth.users(id) on delete cascade;

update public.sections
set
  workspace_id = coalesce(workspace_id, user_id),
  created_by = coalesce(created_by, user_id)
where workspace_id is null or created_by is null;

alter table public.sections
  alter column workspace_id set not null,
  alter column created_by set not null;

alter table public.tasks
  add column if not exists workspace_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_by uuid references auth.users(id) on delete cascade;

update public.tasks t
set
  workspace_id = coalesce(t.workspace_id, s.workspace_id, t.user_id),
  created_by = coalesce(t.created_by, t.user_id)
from public.sections s
where t.section_id = s.id
  and (t.workspace_id is null or t.created_by is null);

update public.tasks
set
  workspace_id = coalesce(workspace_id, user_id),
  created_by = coalesce(created_by, user_id)
where workspace_id is null or created_by is null;

alter table public.tasks
  alter column workspace_id set not null,
  alter column created_by set not null;

alter table public.assignees
  add column if not exists workspace_id uuid references auth.users(id) on delete cascade,
  add column if not exists linked_user_id uuid references auth.users(id) on delete set null;

update public.assignees
set workspace_id = coalesce(workspace_id, user_id)
where workspace_id is null;

alter table public.assignees
  alter column workspace_id set not null;

-- helpers for RLS
create or replace function public.current_workspace_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.role = 'admin'::public.user_role then p.id
    else p.admin_id
  end
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.user_role
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
        or s.created_by = auth.uid()
      )
  );
$$;

create or replace function public.can_toggle_task(task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    left join public.assignees a on a.id = t.assignee_id
    where t.id = task_id
      and t.workspace_id = public.current_workspace_id()
      and (
        public.is_admin()
        or a.linked_user_id = auth.uid()
      )
  );
$$;

-- profiles RLS
alter table public.profiles enable row level security;

create policy "profiles_select_team" on public.profiles
  for select using (
    id = auth.uid()
    or (public.is_admin() and admin_id = auth.uid())
  );

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- replace section policies
drop policy if exists "sections_select_own" on public.sections;
drop policy if exists "sections_insert_own" on public.sections;
drop policy if exists "sections_update_own" on public.sections;
drop policy if exists "sections_delete_own" on public.sections;

create policy "sections_select_workspace" on public.sections
  for select using (workspace_id = public.current_workspace_id());

create policy "sections_insert_workspace" on public.sections
  for insert with check (
    workspace_id = public.current_workspace_id()
    and created_by = auth.uid()
  );

create policy "sections_update_manage" on public.sections
  for update using (public.can_manage_section(id));

create policy "sections_delete_manage" on public.sections
  for delete using (public.can_manage_section(id));

-- replace task policies
drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_workspace" on public.tasks
  for select using (workspace_id = public.current_workspace_id());

create policy "tasks_insert_manage" on public.tasks
  for insert with check (
    workspace_id = public.current_workspace_id()
    and created_by = auth.uid()
    and public.can_manage_section(section_id)
  );

create policy "tasks_update_manage" on public.tasks
  for update using (
    workspace_id = public.current_workspace_id()
    and public.can_manage_section(section_id)
  );

create policy "tasks_update_toggle" on public.tasks
  for update using (public.can_toggle_task(id))
  with check (public.can_toggle_task(id));

create policy "tasks_delete_manage" on public.tasks
  for delete using (
    workspace_id = public.current_workspace_id()
    and public.can_manage_section(section_id)
  );

-- assignees: workspace scoped, admin manages
drop policy if exists "assignees_select_own" on public.assignees;
drop policy if exists "assignees_insert_own" on public.assignees;
drop policy if exists "assignees_update_own" on public.assignees;
drop policy if exists "assignees_delete_own" on public.assignees;

create policy "assignees_select_workspace" on public.assignees
  for select using (workspace_id = public.current_workspace_id());

create policy "assignees_insert_admin" on public.assignees
  for insert with check (
    workspace_id = public.current_workspace_id()
    and public.is_admin()
  );

create policy "assignees_update_admin" on public.assignees
  for update using (
    workspace_id = public.current_workspace_id()
    and public.is_admin()
  );

create policy "assignees_delete_admin" on public.assignees
  for delete using (
    workspace_id = public.current_workspace_id()
    and public.is_admin()
  );

-- bootstrap profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user_id uuid;
begin
  select p.id into admin_user_id
  from public.profiles p
  where p.role = 'admin'::public.user_role
  order by p.created_at
  limit 1;

  if admin_user_id is null then
    insert into public.profiles (id, email, role, display_name)
    values (
      new.id,
      new.email,
      'admin'::public.user_role,
      split_part(new.email, '@', 1)
    );
  else
    insert into public.profiles (id, email, role, admin_id, display_name)
    values (
      new.id,
      new.email,
      'member'::public.user_role,
      admin_user_id,
      split_part(new.email, '@', 1)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill profiles for existing users (first user = admin, rest = members)
with ranked_users as (
  select
    u.id,
    u.email,
    row_number() over (order by u.created_at) as rn
  from auth.users u
  where not exists (select 1 from public.profiles p where p.id = u.id)
),
first_admin as (
  select id as admin_id
  from ranked_users
  where rn = 1
)
insert into public.profiles (id, email, role, admin_id, display_name)
select
  ru.id,
  ru.email,
  case when ru.rn = 1 then 'admin'::public.user_role else 'member'::public.user_role end,
  case when ru.rn = 1 then null::uuid else fa.admin_id end,
  split_part(ru.email, '@', 1)
from ranked_users ru
cross join first_admin fa
on conflict (id) do nothing;

alter table public.assignees drop constraint if exists assignees_user_id_name_key;
alter table public.assignees
  add constraint assignees_workspace_id_name_key unique (workspace_id, name);

create index if not exists sections_workspace_id_idx on public.sections(workspace_id);
create index if not exists tasks_workspace_id_idx on public.tasks(workspace_id);
create index if not exists assignees_workspace_id_idx on public.assignees(workspace_id);
