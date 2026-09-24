export function nextPath(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  return next
}
