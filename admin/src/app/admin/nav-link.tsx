'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminNavLink({
  href,
  children,
}: {
  href: '/admin' | '/admin/services'
  children: string
}) {
  const pathname = usePathname()
  const active =
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-sm transition-colors',
        active
          ? 'font-semibold text-primary'
          : 'font-normal text-muted-foreground hover:text-foreground',
      )}
    >
      <NavLabel>{children}</NavLabel>
    </Link>
  )
}

function NavLabel({ children }: { children: string }) {
  const { pending } = useLinkStatus()
  return <span className={pending ? 'underline decoration-foreground/40' : undefined}>{children}</span>
}