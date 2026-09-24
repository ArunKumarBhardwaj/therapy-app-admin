export function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function passwordIssue(value: string): string | null {
  if (value.length < 8) return 'Use at least 8 characters.'
  return null
}

export function authMessage(error: { message: string } | null): string | null {
  if (!error) return null
  const message = error.message.toLowerCase()
  if (message.includes('invalid login')) return 'Those credentials were not accepted.'
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'An account with that email already exists.'
  }
  if (message.includes('password')) return 'Choose a password of at least 8 characters.'
  if (message.includes('email not confirmed')) {
    return 'Confirm the email we sent, then sign in.'
  }
  return 'Something went wrong. Try again in a moment.'
}
