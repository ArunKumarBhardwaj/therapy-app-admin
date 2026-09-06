import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatJoined } from '@/lib/format'
import { listProfiles } from '@/lib/profiles'
import { requireAdmin } from '@/lib/session'
import { listServices } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminPage() {
  const auth = await requireAdmin()
  const [people, services] = auth
    ? await Promise.all([listProfiles(auth.supabase), listServices(auth.supabase)])
    : [[], []]

  const live = services.filter((service) => service.isActive).length

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts and what is live on the public site.
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-6 border-y border-border py-5">
        <div>
          <dt className="text-sm text-muted-foreground">People</dt>
          <dd className="mt-1 text-3xl font-medium tracking-tight tabular-nums">
            {people.length}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Services</dt>
          <dd className="mt-1 text-3xl font-medium tracking-tight tabular-nums">
            {services.length}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Public</dt>
          <dd className="mt-1 text-3xl font-medium tracking-tight tabular-nums">
            {live}
          </dd>
        </div>
      </dl>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium">People</h2>
          <Link
            href="/admin/services"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit services
          </Link>
        </div>

        {people.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No accounts yet. People appear here after they sign up.
          </p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    {person.fullName ?? person.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={person.role === 'admin' ? 'default' : 'secondary'}>
                      {person.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatJoined(person.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
