import type { Service } from '@/lib/domain'
import { normalizeName } from '@/lib/text'
import { THERAPIES, type Therapy } from '@/features/therapies/catalog'

export type Offering = {
  therapy: Therapy
  service: Service | null
}

function matches(therapy: Therapy, title: string) {
  const normalized = normalizeName(title)
  if (!normalized) return false
  return therapy.aliases.some(
    (alias) => normalized.includes(alias) || alias.includes(normalized),
  )
}

function fromService(service: Service): Therapy {
  return {
    slug: `service-${service.id}`,
    name: service.title,
    alsoCalled: null,
    group: 'body',
    focus: 'Published by Ojas',
    summary: service.description || 'A treatment published by Ojas.',
    soughtFor: [],
    typicalMinutes: service.durationMinutes,
    aliases: [normalizeName(service.title)],
  }
}

export function buildOfferings(services: Service[]): Offering[] {
  const used = new Set<string>()
  const catalog = THERAPIES.map((therapy) => {
    const service =
      services.find((item) => !used.has(item.id) && matches(therapy, item.title)) ??
      null
    if (service) used.add(service.id)
    return { therapy, service }
  })
  const extras = services
    .filter((service) => !used.has(service.id))
    .map((service) => ({ therapy: fromService(service), service }))
  return [...extras, ...catalog]
}

export function therapyForTitle(title: string | null): Therapy | null {
  if (!title) return null
  return THERAPIES.find((therapy) => matches(therapy, title)) ?? null
}

export function findOffering(slug: string, services: Service[]): Offering | null {
  return buildOfferings(services).find((offering) => offering.therapy.slug === slug) ?? null
}
