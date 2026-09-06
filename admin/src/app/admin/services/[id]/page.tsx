import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { updateService } from '@/app/admin/services/actions'
import { ServiceForm } from '@/app/admin/services/service-form'
import { publicMediaUrl } from '@/lib/domain'
import { getService } from '@/lib/services'
import { requireAdmin } from '@/lib/session'
import { publicEnv } from '@/lib/supabase/env'

export const metadata: Metadata = {
  title: 'Edit service',
}

export default async function EditServicePage({
  params,
}: PageProps<'/admin/services/[id]'>) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth) notFound()

  const service = await getService(auth.supabase, id)
  if (!service) notFound()

  const env = publicEnv()
  const action = updateService.bind(null, service.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">Edit service</h1>
        <p className="mt-1 text-sm text-muted-foreground">{service.title}</p>
      </div>
      <ServiceForm
        service={service}
        action={action}
        imageUrl={publicMediaUrl(service.imagePath, env?.url)}
        videoUrl={publicMediaUrl(service.videoPath, env?.url)}
      />
    </div>
  )
}
