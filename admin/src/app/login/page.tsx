import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/app/login/login-form'
import { adminProfile } from '@/lib/domain'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin sign in',
}

function devLoginDefaults() {
  if (process.env.NODE_ENV !== 'development') return undefined
  const email = process.env.DEV_ADMIN_EMAIL
  const password = process.env.DEV_ADMIN_PASSWORD
  if (!email || !password) return undefined
  return { email, password }
}

export default async function LoginPage() {
  const session = await getSession()
  if (adminProfile(session)) {
    redirect('/admin')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <p className="font-serif text-2xl tracking-tight">Haven</p>
          <h1 className="text-lg font-medium">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">
            Staff only. There is no public sign up.
          </p>
        </div>
        <LoginForm defaults={devLoginDefaults()} />
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Back to the practice
          </Link>
        </p>
      </div>
    </div>
  )
}
