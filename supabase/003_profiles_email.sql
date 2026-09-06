alter table public.profiles
  add column if not exists email text;

update public.profiles as p
set email = u.email
from auth.users as u
where u.id = p.id
  and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'user'
  );
  return new;
end;
$$;
