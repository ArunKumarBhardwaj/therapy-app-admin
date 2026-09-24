import type { Metadata } from 'next'
import Link from 'next/link'
import { ToggleActiveButton } from '@/app/admin/services/toggle-active-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDuration, formatPrice } from '@/lib/format'
import { listServices } from '@/lib/services'
import { ensureTherapyCatalog } from '@/lib/therapy-seed'
import { requireAdmin } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Services',
}

export default async function ServicesPage() {
  const auth = await requireAdmin()
  if (auth) await ensureTherapyCatalog(auth.supabase)
  const services = auth ? await listServices(auth.supabase) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These are the 25 treatments. Active ones show in the app. Set a price before you take bookings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">New service</Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.title}</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell>{formatDuration(service.durationMinutes)}</TableCell>
                <TableCell>
                  <Badge variant={service.isActive ? 'default' : 'secondary'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ToggleActiveButton id={service.id} isActive={service.isActive} />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/services/${service.id}`}>Edit</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
