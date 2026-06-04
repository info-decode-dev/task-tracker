-- Use display_name from sign-up metadata when creating profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user_id uuid;
  user_display_name text;
begin
  user_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)
  );

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
      user_display_name
    );
  else
    insert into public.profiles (id, email, role, admin_id, display_name)
    values (
      new.id,
      new.email,
      'member'::public.user_role,
      admin_user_id,
      user_display_name
    );
  end if;

  return new;
end;
$$;
