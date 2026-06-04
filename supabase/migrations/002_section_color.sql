-- bookmark color id (rose, amber, sky, etc.)
alter table public.sections
  add column if not exists color text not null default 'rose';
