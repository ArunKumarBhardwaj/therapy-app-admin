-- Shared contract for admin and the future mobile app.
-- Run once in the Supabase SQL editor.

create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_path text,
  video_path text,
  price numeric(10, 2) not null default 0,
  duration_minutes integer not null default 60,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  preferred_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  user_name text not null,
  user_email text not null,
  user_phone text,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy profiles_admin_update
  on public.profiles for update
  using (public.is_admin());

create policy services_public_read
  on public.services for select
  using (is_active = true or public.is_admin());

create policy services_admin_write
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

create policy bookings_own
  on public.bookings for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('service-media', 'service-media', true)
on conflict (id) do nothing;

create policy service_media_public_read
  on storage.objects for select
  using (bucket_id = 'service-media');

create policy service_media_admin_write
  on storage.objects for insert
  with check (bucket_id = 'service-media' and public.is_admin());

create policy service_media_admin_update
  on storage.objects for update
  using (bucket_id = 'service-media' and public.is_admin());

create policy service_media_admin_delete
  on storage.objects for delete
  using (bucket_id = 'service-media' and public.is_admin());
