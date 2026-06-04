alter table public.sections
  add column if not exists priority boolean not null default false;

create index if not exists sections_workspace_priority_idx
  on public.sections (workspace_id, priority desc, position asc);
