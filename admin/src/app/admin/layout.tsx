import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import { AdminNavLink } from '@/app/admin/nav-link'
import { Button } from '@/components/ui/button'
import { adminProfile } from '@/lib/domain'
import { getSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'

export default function AdminLayout({
  children,
}: LayoutProps<'/admin'>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-baseline gap-6">
            <Link href="/admin" className="font-serif text-xl tracking-tight">
              Ojas
            </Link>
            <nav className="flex gap-4">
              <AdminNavLink href="/admin">Dashboard</AdminNavLink>
              <AdminNavLink href="/admin/services">Services</AdminNavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Suspense fallback={null}>
              <AdminIdentity />
            </Suspense>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </div>
    </div>
  )
}

function AdminLoadingFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

async function AdminIdentity() {
  const session = await getSession()
  const profile = adminProfile(session)
  if (!profile) return null
  return (
    <p className="hidden text-sm text-muted-foreground sm:block">
      {profile.fullName ?? profile.id}
    </p>
  )
}

async function AdminGate({ children }: { children: ReactNode }) {
  const session = await getSession()
  const profile = adminProfile(session)

  if (!profile) {
    if (session.status === 'signed-in') {
      const supabase = await createClient()
      await supabase?.auth.signOut()
    }
    redirect('/login')
  }

  return children
}
