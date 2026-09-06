-- After you create the first Auth user in the Supabase dashboard, run this
-- with that user's email so /admin will accept the session.

update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'REPLACE_WITH_ADMIN_EMAIL'
);
