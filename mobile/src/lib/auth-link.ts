export type AuthLink = {
  accessToken: string | null
  refreshToken: string | null
  type: string | null
  error: string | null
}

function readParams(source: string): URLSearchParams {
  const hashIndex = source.indexOf('#')
  const queryIndex = source.indexOf('?')
  const hash = hashIndex >= 0 ? source.slice(hashIndex + 1) : ''
  const query =
    queryIndex >= 0
      ? source.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined)
      : ''
  const hashParams = new URLSearchParams(hash)
  const queryParams = new URLSearchParams(query)
  const merged = new URLSearchParams(queryParams)
  hashParams.forEach((value, key) => {
    merged.set(key, value)
  })
  return merged
}

export function parseAuthLink(url: string): AuthLink {
  const params = readParams(url)
  const description = params.get('error_description')
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
    error: description ? description.replaceAll('+', ' ') : params.get('error'),
  }
}
