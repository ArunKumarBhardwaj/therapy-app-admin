const THERAPY_ART: Record<string, number> = {
  vamana: require('../../../assets/therapy-vamana.png'),
  virechana: require('../../../assets/therapy-virechana.png'),
  'sneha-vasti': require('../../../assets/therapy-sneha-vasti.png'),
  nasya: require('../../../assets/therapy-nasya.png'),
  'kashaya-vasti': require('../../../assets/therapy-kashaya-vasti.png'),
  abhyanga: require('../../../assets/therapy-abhyanga.png'),
  tarpana: require('../../../assets/therapy-tarpana.png'),
  putapaka: require('../../../assets/therapy-putapaka.png'),
  pichu: require('../../../assets/therapy-pichu.png'),
  pizhichil: require('../../../assets/therapy-pizhichil.png'),
  thalapothichil: require('../../../assets/therapy-thalapothichil.png'),
  shirovasthi: require('../../../assets/therapy-shirovasthi.png'),
  podikizhi: require('../../../assets/therapy-podikizhi.png'),
  lepana: require('../../../assets/therapy-lepana.png'),
  'dhanyamla-dhara': require('../../../assets/therapy-dhanyamla-dhara.png'),
  'kati-vasti': require('../../../assets/therapy-kati-vasti.png'),
  upanaha: require('../../../assets/therapy-upanaha.png'),
  thalam: require('../../../assets/therapy-thalam.png'),
  raktamokshana: require('../../../assets/therapy-raktamokshana.png'),
  udwarthanam: require('../../../assets/therapy-udwarthanam.png'),
  'ksheera-dhooma': require('../../../assets/therapy-ksheera-dhooma.png'),
  ksheeradhara: require('../../../assets/therapy-ksheeradhara.png'),
  avagaha: require('../../../assets/therapy-avagaha.png'),
  navarakizhi: require('../../../assets/therapy-navarakizhi.png'),
  narangakizhi: require('../../../assets/therapy-narangakizhi.png'),
}

export type TherapyImage = number | { uri: string } | null

export function therapyImage(slug: string, uploaded: string | null): TherapyImage {
  if (uploaded && !uploaded.endsWith('/therapy.png')) return { uri: uploaded }
  const local = THERAPY_ART[slug]
  if (local) return local
  if (uploaded) return { uri: uploaded }
  return null
}
