import type { Metadata } from 'next'
import { createService } from '@/app/admin/services/actions'
import { ServiceForm } from '@/app/admin/services/service-form'

export const metadata: Metadata = {
  title: 'New service',
}

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">New service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Media is stored in the service-media bucket. The public page uses the path, not a baked URL.
        </p>
      </div>
      <ServiceForm action={createService} />
    </div>
  )
}
