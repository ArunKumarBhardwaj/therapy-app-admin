import type { SupabaseClient } from '@supabase/supabase-js'

const THERAPIES: { title: string; description: string; durationMinutes: number }[] = [
  {
    title: 'Vamana',
    description:
      'A supervised kapha cleanse, booked only as part of a panchakarma course after the body has been prepared.',
    durationMinutes: 90,
  },
  {
    title: 'Virechana',
    description:
      'A purgation session that clears heat from the digestive tract. The preparation is chosen for the person.',
    durationMinutes: 90,
  },
  {
    title: 'Sneha Vasti',
    description: 'An oil enema given after a meal, used when vata needs settling through the colon.',
    durationMinutes: 45,
  },
  {
    title: 'Nasya',
    description: 'Medicated oil given through the nose, the route used for the organs above the neck.',
    durationMinutes: 30,
  },
  {
    title: 'Kashaya Vasti',
    description:
      'A herbal decoction enema given before a meal, usually paired with sneha vasti in a longer course.',
    durationMinutes: 45,
  },
  {
    title: 'Abhyanga',
    description: 'Warm herbal oil worked over the body in long, even strokes. Also called Uzhichil.',
    durationMinutes: 60,
  },
  {
    title: 'Tarpana',
    description:
      'A dough ring around the eyes holds warm medicated ghee while the eyes rest open. Also called Tharpanam.',
    durationMinutes: 30,
  },
  {
    title: 'Putapaka',
    description: 'Herbal juice poured over the eyes after tarpana, to clear remaining ghee. Also called Putapakam.',
    durationMinutes: 20,
  },
  {
    title: 'Pichu',
    description: 'A cloth soaked in warm medicated oil is kept on the sore place.',
    durationMinutes: 40,
  },
  {
    title: 'Pizhichil',
    description: 'Warm medicated oil poured in a continuous stream while the body is massaged.',
    durationMinutes: 60,
  },
  {
    title: 'Thalapothichil',
    description: 'Oil on the scalp, then a cool herbal paste covering the head.',
    durationMinutes: 45,
  },
  {
    title: 'Shirovasthi',
    description: 'Medicated oil held on the head inside a fitted cap. Also called Sirovasthy.',
    durationMinutes: 45,
  },
  {
    title: 'Podikizhi',
    description: 'Heated cloth bundles of herbal powder tapped and pressed along the body. Also called Podikizhy.',
    durationMinutes: 45,
  },
  {
    title: 'Lepana',
    description: 'A herbal paste spread on the area that needs cooling, then left to dry. Also called Lepanam.',
    durationMinutes: 30,
  },
  {
    title: 'Dhanyamla Dhara',
    description: 'A warm, sour herbal liquid poured in a stream after a light oil massage.',
    durationMinutes: 45,
  },
  {
    title: 'Kati Vasti',
    description: 'A dough dam holds warm oil over the back or another stiff area. Also called Kateevasthy.',
    durationMinutes: 40,
  },
  {
    title: 'Upanaha',
    description: 'A thick herbal paste covered with leaves and cloth and left in place. Also called Upanaham.',
    durationMinutes: 40,
  },
  {
    title: 'Thalam',
    description: 'A small amount of herbal paste or oil placed at the center of the scalp.',
    durationMinutes: 20,
  },
  {
    title: 'Raktamokshana',
    description:
      'A practitioner-led session for local congestion. Clinical, and offered only as a published treatment. Also called Rakthamoksham.',
    durationMinutes: 40,
  },
  {
    title: 'Udwarthanam',
    description: 'A firm massage with warm herbal powder, moving against the hair.',
    durationMinutes: 45,
  },
  {
    title: 'Ksheera Dhooma',
    description:
      'Herbal milk steam directed at the face and neck after oiling, with the eyes covered. Also called Ksheera Dhoomam.',
    durationMinutes: 30,
  },
  {
    title: 'Ksheeradhara',
    description: 'A steady stream of herb-infused milk poured on the forehead.',
    durationMinutes: 50,
  },
  {
    title: 'Avagaha',
    description: 'A sit in a warm tub of herbal water after oil has been applied. Also called Avagaham.',
    durationMinutes: 30,
  },
  {
    title: 'Navarakizhi',
    description: 'Soft bundles of cooked navara rice, dipped in warm milk and stroked over the body.',
    durationMinutes: 60,
  },
  {
    title: 'Narangakizhi',
    description: 'A firmer bundle massage using fresh lemon and herbs tied in cloth.',
    durationMinutes: 45,
  },
]

export async function ensureTherapyCatalog(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('services').select('title')
  if (error) return

  const have = new Set(
    (data ?? []).map((row) => String(row.title ?? '').trim().toLowerCase()),
  )
  const missing = THERAPIES.filter((therapy) => !have.has(therapy.title.toLowerCase()))
  if (missing.length === 0) return

  await supabase.from('services').insert(
    missing.map((therapy) => ({
      title: therapy.title,
      description: therapy.description,
      price: 0,
      duration_minutes: therapy.durationMinutes,
      is_active: true,
    })),
  )
}
