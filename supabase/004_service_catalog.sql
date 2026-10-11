-- Move the therapy catalog into services so the admin owns every field the app shows.
-- Also locks bookings so a client can only request and cancel, never confirm.
-- Safe to run more than once.

alter table public.services
  add column if not exists category text not null default 'body',
  add column if not exists focus text not null default '',
  add column if not exists also_called text,
  add column if not exists sought_for text[] not null default '{}',
  add column if not exists sort_order integer not null default 0;

alter table public.services drop constraint if exists services_category_check;
alter table public.services
  add constraint services_category_check
  check (category in ('panchakarma', 'body', 'head', 'eyes', 'local'));

update public.services as s
set
  category = c.category,
  focus = c.focus,
  also_called = c.also_called,
  sought_for = c.sought_for,
  sort_order = c.sort_order
from (values
  ('Vamana', array['vamana', 'vamanan'], 'panchakarma', 'Chest, sinuses, and upper digestion', 'Vamanan', array['Heaviness', 'Sinus congestion', 'Kapha patterns']::text[], 10),
  ('Virechana', array['virechana', 'virechanam'], 'panchakarma', 'Digestion, liver, and spleen', 'Virechanam', array['Heat', 'Skin flare', 'Digestive congestion']::text[], 20),
  ('Sneha Vasti', array['snehavasti', 'snehavasthy', 'snehavasthi'], 'panchakarma', 'Lower digestion', 'Snehavasthy', array['Vata disturbance', 'Pelvic discomfort', 'Spinal ache']::text[], 30),
  ('Nasya', array['nasya', 'nasyam'], 'panchakarma', 'Nose, head, and neck', 'Nasyam', array['Sinus pressure', 'Scalp dryness', 'Head and neck tension']::text[], 40),
  ('Kashaya Vasti', array['kashayavasti', 'kashayavasthy', 'kashavasthy'], 'panchakarma', 'Intestines', 'Kashayavasthy', array['Vata patterns', 'Joint stiffness', 'Nervous fatigue']::text[], 50),
  ('Abhyanga', array['abhyanga', 'uzhichil'], 'body', 'Whole body', 'Uzhichil', array['Tiredness', 'Dry skin', 'Unsettled sleep']::text[], 60),
  ('Pizhichil', array['pizhichil'], 'body', 'Whole body and joints', null, array['Joint wear', 'Nervous fatigue', 'Spinal stiffness']::text[], 70),
  ('Podikizhi', array['podikizhi', 'choornapindasweda', 'podikizhy'], 'body', 'Whole body', 'Choorna Pinda Sweda', array['Inflamed joints', 'Spinal ache', 'Stiffness']::text[], 80),
  ('Udwarthanam', array['udwarthanam', 'udwarthana'], 'body', 'Whole body and lymph', null, array['Heaviness', 'Uneven skin tone', 'Early stiffness']::text[], 90),
  ('Navarakizhi', array['navarakizhi', 'navarakizhy'], 'body', 'Whole body', null, array['Weakness', 'Numbness', 'Muscle wasting']::text[], 100),
  ('Narangakizhi', array['narangakizhi', 'narangakizhy'], 'body', 'Whole body, especially the low back', null, array['Low back ache', 'Sciatica', 'Acute joint heat']::text[], 110),
  ('Dhanyamla Dhara', array['dhanyamladhara', 'dhanyamla'], 'body', 'Whole body', null, array['Inflamed joints', 'Heaviness', 'Acute stiffness']::text[], 120),
  ('Avagaha', array['avagaha', 'avagaham'], 'body', 'Whole body', 'Avagaham', array['Low back pain', 'Hip pain', 'Pelvic discomfort']::text[], 130),
  ('Thalapothichil', array['thalapothichil', 'talapothichil'], 'head', 'Head and scalp', null, array['Mental strain', 'Poor sleep', 'Chronic headache']::text[], 140),
  ('Shirovasthi', array['shirovasthi', 'sirovasthy', 'shirobasti'], 'head', 'Head and scalp', 'Sirovasthy', array['Nervous strain', 'Chronic headache', 'Facial weakness']::text[], 150),
  ('Thalam', array['thalam'], 'head', 'Crown of the head', null, array['Sleeplessness', 'Stress', 'Neck stiffness']::text[], 160),
  ('Ksheeradhara', array['ksheeradhara', 'kheeradhara', 'shirodhara'], 'head', 'Forehead and head', null, array['Heat', 'Headache', 'Restless sleep']::text[], 170),
  ('Ksheera Dhooma', array['ksheeradhooma', 'ksheeradhoomam', 'kheeradhooma'], 'head', 'Head and neck', null, array['Facial stiffness', 'Headache', 'Sense fatigue']::text[], 180),
  ('Tarpana', array['tarpana', 'tharpanam', 'netratarpana'], 'eyes', 'Eyes', 'Tharpanam', array['Eye strain', 'Dryness', 'Tired vision']::text[], 190),
  ('Putapaka', array['putapaka', 'putapakam'], 'eyes', 'Eyes', 'Putapakam', array['After tarpana', 'Irritated eyes']::text[], 200),
  ('Pichu', array['pichu', 'siropichu'], 'local', 'A joint, or the head', null, array['Joint pain', 'Cramps', 'Headache']::text[], 210),
  ('Kati Vasti', array['kativasti', 'kateevasthy', 'katibasti'], 'local', 'Low back, or another joint', 'Kateevasthy', array['Local pain', 'Restricted movement']::text[], 220),
  ('Lepana', array['lepana', 'lepanam'], 'local', 'Skin or a joint', 'Lepanam', array['Local swelling', 'Heat', 'Skin discoloration']::text[], 230),
  ('Upanaha', array['upanaha', 'upanaham'], 'local', 'A joint', 'Upanaham', array['Stiff joints', 'Inflamed joints', 'Wasting']::text[], 240),
  ('Raktamokshana', array['raktamokshana', 'rakthamoksham', 'raktamoksha'], 'local', 'A local area', 'Rakthamoksham', array['Local congestion']::text[], 250)
) as c (name, aliases, category, focus, also_called, sought_for, sort_order)
where lower(s.title) = lower(c.name)
   or regexp_replace(lower(s.title), '[^a-z0-9]+', '', 'g') = any (c.aliases);

drop policy if exists bookings_own on public.bookings;
drop policy if exists bookings_select on public.bookings;
drop policy if exists bookings_insert_own on public.bookings;
drop policy if exists bookings_cancel_own on public.bookings;
drop policy if exists bookings_admin_write on public.bookings;

create policy bookings_select
  on public.bookings for select
  using (user_id = auth.uid() or public.is_admin());

create policy bookings_insert_own
  on public.bookings for insert
  with check ((user_id = auth.uid() and status = 'pending') or public.is_admin());

create policy bookings_cancel_own
  on public.bookings for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'cancelled');

create policy bookings_admin_write
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());
