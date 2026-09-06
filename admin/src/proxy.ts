import { type NextRequest, NextResponse } from 'next/server'
import { createProxyClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')

  if (!isAdminPath) {
    return NextResponse.next()
  }

  const client = createProxyClient(request)
  if (!client) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data } = await client.supabase.auth.getClaims()
  if (!data?.claims.sub) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return client.getResponse()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
